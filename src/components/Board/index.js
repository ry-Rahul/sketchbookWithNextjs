import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./index.module.css";
import { useSelector, useDispatch } from "react-redux";
import { changeColor, changeBrushSize } from "../../slice/toolboxSlice.js";
import { MENU_ITEMS } from "@/constants";
import { menuItemClick, actionItemClick } from "../../slice/menuSlice.js";
import { socket } from "@/socket";
import { config } from "@fortawesome/fontawesome-svg-core";

const Board = () => {
    // useref is a hook that allows us to access the dom element directly
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const drawHistory = useRef([]);
    const historyPointer = useRef(0);
    const shouldDraw = useRef(false);
    const { activeMenuItem, actionMenuItem } = useSelector(
        (state) => state.menu
    );
    const { color, size } = useSelector(
        (state) => state.toolbox[activeMenuItem]
    );

    // download feature
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
            const url = canvas.toDataURL();
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "my-drawing.jpg";
            anchor.click();
            // console.log(url);
        } else if (actionMenuItem === MENU_ITEMS.UNDO) {
            if (historyPointer.current > 0) {
                historyPointer.current -= 1;
                const imgData = drawHistory.current[historyPointer.current];
                context.putImageData(imgData, 0, 0);
            }
        } else if (actionMenuItem === MENU_ITEMS.REDO) {
            if (historyPointer.current < drawHistory.current.length - 1) {
                historyPointer.current += 1;
                const imgData = drawHistory.current[historyPointer.current];
                context.putImageData(imgData, 0, 0);
            }
        }
        dispatch(actionItemClick(null));
    }, [actionMenuItem, dispatch]);

    // console.log(color, size);
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const changeConfig = (color,size) => {
            context.strokeStyle = color;
            context.lineWidth = size;
        };

        changeConfig(color, size);
        // socket function_______________________________________________________
        const handleConfigChange = (data) => {
            changeConfig(data.color, data.size);
        };
        socket.on("changeConfig", handleConfigChange);
    }, [color, size]);

    // Mount the canvas to the dom
    useLayoutEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // resize the canvas to fill browser window dynamically
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const beginPath = ( x,y) => {
            context.beginPath();
            context.moveTo(x, y);
        };
        const drawLine = (x,y) => {
            context.lineTo(x, y);
            context.stroke();
        };

        const handleMouseDown = (event) => {
            shouldDraw.current = true;
            beginPath(event.clientX, event.clientY);
            socket.emit("beginPath", { x: event.clientX, y: event.clientY });
        };

        const handleMouseMove = (event) => {
            if (!shouldDraw.current) return;
            drawLine(event.clientX, event.clientY);
            socket.emit("drawLine", { x: event.clientX, y: event.clientY });
        };

        // Socket.io_function_______________________________________________________
        const handleBeginPath = (data) => {
            console.log("beginPath"+data);
            beginPath(data.x , data.y);
        };
        const handleDrawLine = (data) => {
            console.log(data);
            drawLine(data.x , data.y);
        };

        const handleMouseUp = () => {
            shouldDraw.current = false;
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            drawHistory.current.push(imageData);
            historyPointer.current = drawHistory.current.length - 1;
        };

        socket.on("beginPath", handleBeginPath);
        socket.on("drawLine", handleDrawLine);

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);

            socket.off("beginPath", handleBeginPath);
            socket.off("drawLine", handleDrawLine);
        };
    }, []);
    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    );
};

export default Board;
