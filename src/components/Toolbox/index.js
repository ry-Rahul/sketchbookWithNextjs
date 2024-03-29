import styles from "./index.module.css";
import { COLORS, MENU_ITEMS } from "../../constants.js";
import { useSelector, useDispatch } from "react-redux";
import Draggable from "react-draggable";
import { changeColor, changeBrushSize } from "../../slice/toolboxSlice.js";
import React from "react";
import { PiDotsSixBold } from "react-icons/pi";
import cx from "classnames";
import { socket } from "@/socket.js";

const Toolbox = () => {
    const dispatch = useDispatch();
    const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
    const showStrokeToolOptions = activeMenuItem === MENU_ITEMS.PENCIL;
    const showBrushToolOptions =
        activeMenuItem === MENU_ITEMS.PENCIL ||
        activeMenuItem === MENU_ITEMS.ERASER;
    const { color, size } = useSelector(
        (state) => state.toolbox[activeMenuItem]
    );

    // updateBrushSize function_______________________________________________

    const updateBrushSize = (event) => {
        dispatch(
            changeBrushSize({ item: activeMenuItem, size: event.target.value })
        );
        socket.emit("changeConfig", { color, size: event.target.value });
    };

    const updateColor = (newColor) => {
        dispatch(changeColor({ item: activeMenuItem, color: newColor }));
        socket.emit("changeConfig", { color: newColor, size });
    };

    // draggable function______________________________________________________
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    function handleDrag(e, ui) {
        setPosition({ x: ui.x, y: ui.y });
    }

    function handleStop(e, ui) {
        setPosition({ x: ui.x, y: ui.y });
    }

    return (
        <>
            <Draggable
                bounds="parent" // Constrain dragging within parent element
                position={position}
                onDrag={handleDrag}
                onStop={handleStop}
            >
                <div className={styles.toolboxContainer}>
                    <div className={styles.innerContainer}>
                        <PiDotsSixBold className={styles.dot} />

                        {/* tool items________________________________- */}
                        {showStrokeToolOptions && (
                            <div className={styles.toolItem}>
                                <h4 className={styles.toolText}>
                                    Stroke Color
                                </h4>
                                <div className={styles.itemContainer}>
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.BLACK,
                                        })}
                                        style={{
                                            backgroundColor: COLORS.BLACK,
                                        }}
                                        onClick={() =>
                                            updateColor(COLORS.BLACK)
                                        }
                                    />
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.RED,
                                        })}
                                        style={{ backgroundColor: COLORS.RED }}
                                        onClick={() => updateColor(COLORS.RED)}
                                    />
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.BLUE,
                                        })}
                                        style={{ backgroundColor: COLORS.BLUE }}
                                        onClick={() => updateColor(COLORS.BLUE)}
                                    />
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.GREEN,
                                        })}
                                        style={{
                                            backgroundColor: COLORS.GREEN,
                                        }}
                                        onClick={() =>
                                            updateColor(COLORS.GREEN)
                                        }
                                    />
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.ORANGE,
                                        })}
                                        style={{
                                            backgroundColor: COLORS.ORANGE,
                                        }}
                                        onClick={() =>
                                            updateColor(COLORS.ORANGE)
                                        }
                                    />
                                    <div
                                        className={cx(styles.colorBox, {
                                            [styles.active]:
                                                color === COLORS.YELLOW,
                                        })}
                                        style={{
                                            backgroundColor: COLORS.YELLOW,
                                        }}
                                        onClick={() =>
                                            updateColor(COLORS.YELLOW)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        {/* Brush____________________________________________________ */}
                        {showBrushToolOptions && (
                            <div className={styles.toolItem}>
                                <h4 className={styles.toolText}>
                                    Brush Size {activeMenuItem}
                                </h4>
                                <div className={styles.itemContainer}>
                                    <input
                                        type="range"
                                        min={1}
                                        max={10}
                                        step={1}
                                        onChange={updateBrushSize}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Draggable>
        </>
    );
};

export default Toolbox;
