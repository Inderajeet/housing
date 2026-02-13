import React, { useState, useEffect, useMemo } from 'react';
import { endpoints } from '../api/api';
import '../styles/UnitSelector.css';

const UnitSelector = ({ propertyId, onSelectUnit, saleType, onNoPlots }) => {
    const [dims, setDims] = useState({ rows: 40, cols: 60 });
    const [gridData, setGridData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hasPlots, setHasPlots] = useState(true);

    const refreshPlotNumbers = (currentGrid) => {
        const newGrid = { ...currentGrid };
        const plotKeys = Object.keys(newGrid).filter(
            (key) => newGrid[key].type === 'PLOT' && !newGrid[key].merged
        );
        plotKeys.sort((a, b) => {
            const [rA, cA] = a.split('-').map(Number);
            const [rB, cB] = b.split('-').map(Number);
            return rA !== rB ? rA - rB : cA - cB;
        });

        let currentAutoIndex = 1;
        plotKeys.forEach((key) => {
            const cell = newGrid[key];

            // If backend provides plot_number, use it
            if (cell.plot_number) {
                cell.display_name = cell.plot_number.toString();
                cell.isManual = true;
            } else if (!(cell.isManual && cell.display_name !== "")) {
                // fallback auto-numbering
                cell.display_name = currentAutoIndex.toString();
                cell.isManual = false;
                currentAutoIndex++;
            }
        });

        return newGrid;
    };


    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const res = await endpoints.getPlotLayout(propertyId);
                const rawItems = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                console.log("Fetched layout items:", rawItems);

                const plotItems = rawItems.filter(item => item.plot_unit_id != null);
                const layoutItems = rawItems.filter(item => item.plot_unit_id == null);

                const mapped = {};
                let minR = Number.POSITIVE_INFINITY;
                let minC = Number.POSITIVE_INFINITY;
                let maxR = 0;
                let maxC = 0;

                // map layout elements first
                layoutItems.forEach(item => {
                    const x = parseInt(item.x, 10);
                    const y = parseInt(item.y, 10);
                    const w = parseInt(item.width, 10) || 1;
                    const h = parseInt(item.height, 10) || 1;
                    if (isNaN(x) || isNaN(y)) return;
                    if (y < minR) minR = y;
                    if (x < minC) minC = x;
                    if (y + h > maxR) maxR = y + h;
                    if (x + w > maxC) maxC = x + w;

                    const key = `${y}-${x}`;
                    mapped[key] = {
                        ...item,
                        row: y,
                        col: x,
                        colSpan: w,
                        rowSpan: h,
                        display_name: item.name || item.label || '',
                        type: item.type || 'PLOT',
                        rotation: item.rotation || 0,
                        color: item.color || (item.type === 'TEXT' ? '#1e293b' : '#ffffff'),
                        font_size: item.font_size || 10,
                        font_weight: item.font_weight || '900'
                    };

                    // handle merged cells
                    if (w > 1 || h > 1) {
                        for (let r = 0; r < h; r++) {
                            for (let c = 0; c < w; c++) {
                                if (r === 0 && c === 0) continue;
                                mapped[`${y + r}-${x + c}`] = { merged: true, anchorKey: key };
                            }
                        }
                    }
                });

                // map plots to the layout by matching `name` to `plot_number`
                plotItems.forEach(plot => {
                    const cellKey = Object.keys(mapped).find(
                        key => mapped[key].display_name === plot.plot_number.toString()
                    );
                    if (cellKey) {
                        mapped[cellKey] = {
                            ...mapped[cellKey],
                            plot_unit_id: plot.plot_unit_id,
                            status: plot.status.toUpperCase() || 'NIL_BOOKING'
                        };
                    } else {
                        // if not found, just add plot in empty grid
                        const key = `${plot.y || 0}-${plot.x || 0}`;
                        mapped[key] = {
                            ...plot,
                            row: plot.y || 0,
                            col: plot.x || 0,
                            colSpan: 1,
                            rowSpan: 1,
                            display_name: plot.plot_number.toString(),
                            type: 'PLOT',
                            status: plot.status.toUpperCase() || 'NIL_BOOKING'
                        };
                    }
                });

                if (!Number.isFinite(minR)) {
                    setDims({ rows: 0, cols: 0 });
                    setGridData({});
                    setHasPlots(false);
                } else {
                    const normalized = {};
                    Object.keys(mapped).forEach((key) => {
                        const cell = mapped[key];
                        if (cell.merged) {
                            const [r, c] = key.split('-').map(Number);
                            const newKey = `${r - minR}-${c - minC}`;
                            normalized[newKey] = { ...cell };
                            return;
                        }
                        const newRow = cell.row - minR;
                        const newCol = cell.col - minC;
                        const newKey = `${newRow}-${newCol}`;
                        normalized[newKey] = { ...cell, row: newRow, col: newCol };
                    });
                    setDims({ rows: maxR - minR + 1, cols: maxC - minC + 1 });
                    setGridData(refreshPlotNumbers(normalized));
                    const anyPlots = Object.values(normalized).some(
                        (cell) => cell && !cell.merged && (cell.type || 'PLOT') === 'PLOT'
                    );
                    setHasPlots(anyPlots);
                }
            } catch (err) {
                console.error("Layout fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLayout();
    }, [propertyId]);

    useEffect(() => {
        if (!loading && !hasPlots) {
            onNoPlots?.();
        }
    }, [loading, hasPlots, onNoPlots]);

    const rowsArray = useMemo(() => Array.from({ length: dims.rows }), [dims.rows]);
    const colsArray = useMemo(() => Array.from({ length: dims.cols }), [dims.cols]);

    if (loading) return <div className="unit-selector-subtitle">Loading Layout...</div>;
    if (!hasPlots) return null;

    const normalizedSaleType = (saleType || '').toLowerCase();
    const titleLabel = normalizedSaleType === 'plot'
        ? 'Book Plots'
        : normalizedSaleType === 'flat'
            ? 'Book Flats'
            : 'Book Plots';

    return (
        <div className="unit-selector-container">
            <h2 className="unit-selector-title">{titleLabel}</h2>
            <p className="unit-selector-subtitle">Please click on an available plot to continue</p>

            <div className="unit-grid-scroll">
                <div
                    className="unit-grid-wrapper"
                    style={{
                        gridTemplateColumns: `repeat(${dims.cols}, var(--unit-cell))`,
                        gridAutoRows: 'var(--unit-cell)'
                    }}
                >
                    {rowsArray.map((_, r) => (
                        colsArray.map((_, c) => {
                            const key = `${r}-${c}`;
                            const cell = gridData[key];
                            if (cell?.merged) return null;

                            let cellClass = "unit-cell";
                            let cellStyle = {};

                            if (cell?.type === 'PLOT') {
                                // Map backend status to class/color
                                switch (cell.status) {
                                    case 'BOOKED':
                                        cellClass += " unit-plot booked";       // yellow
                                        break;
                                    case 'TOKEN_PAID':
                                    case 'ADVANCE_PAID':
                                    case 'CLOSED':
                                        cellClass += " unit-plot token-paid";   // red
                                        break;
                                    case 'ON_BOOKING':
                                        cellClass += " unit-plot on-booking";   // saffron/orange
                                        break;
                                    case 'NIL_BOOKING':
                                    default:
                                        cellClass += " unit-plot available";    // green
                                        break;
                                }

                                cellStyle = {
                                    fontSize: `${cell.font_size}px`,
                                    fontWeight: cell.font_weight,
                                    transform: `rotate(${cell.rotation}deg)`
                                };
                            }
                            else if (cell?.type === 'ROAD') {
                                cellClass += " unit-road";
                            } else if (cell?.type === 'TEXT') {
                                cellClass += " unit-text";
                                cellStyle = {
                                    color: cell.color,
                                    fontSize: `${cell.font_size}px`,
                                    fontWeight: cell.font_weight,
                                    transform: `rotate(${cell.rotation}deg)`
                                };
                            } else {
                                cellClass += " unit-empty";
                            }

                            const handleClick = () => {
                                if (cell?.type === 'PLOT' && cell.status !== 'BOOKED') {
                                    onSelectUnit(cell);
                                }
                            };

                            return (
                                <div
                                    key={key}
                                    className={cellClass}
                                    style={{
                                        gridColumnStart: c + 1,
                                        gridColumnEnd: `span ${cell?.colSpan || 1}`,
                                        gridRowStart: r + 1,
                                        gridRowEnd: `span ${cell?.rowSpan || 1}`
                                    }}
                                    onClick={handleClick}
                                >
                                    {cell?.display_name && (
                                        <span style={cellStyle} className="unit-label">
                                            {cell.display_name}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            <div className="unit-legend">
                <div className="legend-item">
                    <div className="legend-dot legend-available"></div> Available
                </div>
                <div className="legend-item">
                    <div className="legend-dot legend-on-booking"></div> On Booking
                </div>
                <div className="legend-item">
                    <div className="legend-dot legend-booked"></div> Booked
                </div>
            </div>
        </div>
    );
};

export default UnitSelector;
