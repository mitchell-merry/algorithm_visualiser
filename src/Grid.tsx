import React, { useEffect, useRef } from "react";
import './Grid.css';
import { useStateWithCallbackLazy } from "use-state-with-callback";

export interface GridProps {
    width: number;
    height: number;
}

const coordIsIn = (array: coordinate[], element: coordinate): boolean => {
    return array.some((coord) => coord[0] === element[0] && coord[1] === element[1]);
}

const waitTime = 20;

function getEmptyGrid(width: number, height: number): number[][] {
    const o: number[][] = [];
    for (let row = 0; row < height; row++) {
      o.push([]);
      for (let col = 0; col < width; col++) {
        o[row].push(0);
      }
    }
    return o;
}

type coordinate = [row: number, col: number];

export const Grid: React.FC<GridProps> = ({ width, height }) => {
    const [ cells, setCells ] = useStateWithCallbackLazy<number[][]>(getEmptyGrid(width, height));
    const nextCells = useRef<coordinate[]>([]);

    const isOob = (coord: coordinate): boolean => (coord[0] < 0 || coord[1] < 0 || coord[0] >= height || coord[1] >= width);

    const getNeighbours = (grid: number[][], coord: coordinate): coordinate[] => {
        const o: coordinate[] = [];

        const relativeCoordsOfNeighbours: coordinate[] = [ [1, 0], [0, 1], [-1, 0], [0, -1] ];

        for(const relativeNeighbour of relativeCoordsOfNeighbours) {
            const n: coordinate = [coord[0]+relativeNeighbour[0], coord[1]+relativeNeighbour[1]];
            
            if(!isOob(n) && grid[n[0]][n[1]] !== 1) o.push(n);
        }

        return o;
    }

    const renderNextFrame = async (nextCoords: coordinate[], depth: number): Promise<void> => {
        // Actually set the new cells according to the new frame
        setCells(cells => {
            // Deep copy the 2D array
            const newCells = cells.map(row => row.slice());

            // Update newCells with our next coordinates
            nextCoords.forEach(coord => {
                newCells[coord[0]][coord[1]] = 1;
            })

            // Render
            return newCells;
        }, (currentCells: number[][]) => {for(const coord of nextCoords) {
            const newNeighbours = getNeighbours(currentCells, coord);
            const n: coordinate[] = [];
            newNeighbours.forEach(newNeighbour => {
                if(!coordIsIn(nextCells.current, newNeighbour)) n.push(newNeighbour);
            })
            nextCells.current.push(...n);
        }})
    }

    const handleClick = (rowIdx: number, colIdx: number): void => {
        nextCells.current.push([rowIdx, colIdx]);
    }

    useEffect(() => {setInterval(() => {
        if(nextCells.current.length === 0) return;

        renderNextFrame(nextCells.current, 1).then(() => {
            nextCells.current = [];
        });
    }, waitTime);}, [])


    if (!cells) return <div>Loading...</div>;
    return (
        <div id="grid">
            {cells.map((row, rowIdx) => (
                <div className={"row"} key={rowIdx}>
                    {row.map((cellValue, colIdx) => (
                        <div className={"cell " + (cellValue === 1 ? 'active' : '')} key={`${rowIdx} ${colIdx}`} onClick={(e) => handleClick(rowIdx, colIdx)} />
                    ))}
                </div>
            ))}
        </div>
  );
}