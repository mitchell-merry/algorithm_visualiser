import React, { useEffect, useRef } from "react";
import './Grid.css';
import { useStateWithCallbackLazy } from "use-state-with-callback";

export interface GridProps {
    width: number;
    height: number;
    random?: boolean;
}

const coordIsIn = (array: coordinate[], element: coordinate): number => {
    return array.findIndex((coord) => coord[0] === element[0] && coord[1] === element[1]);
}

const waitTime = 25;

function getGrid(width: number, height: number, random: boolean): number[][] {
    const o: number[][] = [];
    for (let row = 0; row < height; row++) {
      o.push([]);
      for (let col = 0; col < width; col++) {
        o[row].push(random ? Math.floor(Math.random()*COLOURS.length) : 0);
      }
    }
    return o;
}

const COLOURS = ['red', 'orange', 'yellow', 'green', 'blue'] as const;

type Colour = typeof COLOURS[number];

type coordinate = [row: number, col: number, colour: number];

export const Grid: React.FC<GridProps> = ({ width, height, random }) => {
    const [ cells, setCells ] = useStateWithCallbackLazy<number[][]>(getGrid(width, height, !!random));
    const nextCells = useRef<coordinate[]>([]);
    const currCount = useRef(0);

    const isOob = (coord: coordinate): boolean => (coord[0] < 0 || coord[1] < 0 || coord[0] >= height || coord[1] >= width);

    const getNeighbours = (grid: number[][], coord: coordinate): coordinate[] => {
        const o: coordinate[] = [];

        const relativeCoordsOfNeighbours: coordinate[] = [ [1, 0, coord[2]], [0, 1, coord[2]], [-1, 0, coord[2]], [0, -1, coord[2]] ];

        for(const relativeNeighbour of relativeCoordsOfNeighbours) {
            const n: coordinate = [coord[0]+relativeNeighbour[0], coord[1]+relativeNeighbour[1], coord[2]];
            
            if(!isOob(n) && grid[n[0]][n[1]] < coord[2]) o.push(n);
        }

        return o;
    }

    const handleClick = (rowIdx: number, colIdx: number): void => {
        currCount.current++; 
        if(cells[rowIdx][colIdx] === currCount.current % COLOURS.length) return;
        nextCells.current.push([rowIdx, colIdx, currCount.current]); 

    }

    useEffect(() => {setInterval(() => {
        if(nextCells.current.length === 0) return;

        const nextCoords: coordinate[] = [...nextCells.current];

        nextCells.current = [];

        setCells(cells => {
            // Deep copy the 2D array
            const newCells = cells.map(row => row.slice());

            // Update newCells with our next coordinates
            nextCoords.forEach(coord => {
                newCells[coord[0]][coord[1]] = coord[2];
            })

            // Render
            return newCells;
        }, (currentCells: number[][]) => {for(const coord of nextCoords) {
            const newNeighbours = getNeighbours(currentCells, coord);
            const n: coordinate[] = [];
            newNeighbours.forEach(newNeighbour => {
                const isIn = coordIsIn(nextCells.current, newNeighbour)
                if(isIn === -1) n.push(newNeighbour);
                else if(nextCells.current[isIn][2] < newNeighbour[2]) {
                    nextCells.current[isIn][2] = newNeighbour[2];
                }
            })
            nextCells.current.push(...n);
        }})
        
    }, waitTime);}, [])


    if (!cells) return <div>Loading...</div>;
    return (
        <div id="grid">
            {cells.map((row, rowIdx) => (
                <div className={"row"} key={rowIdx}>
                    {row.map((cellValue, colIdx) => (
                        <div className={"cell " + COLOURS[cellValue % COLOURS.length]} key={`${rowIdx} ${colIdx}`} onMouseDown={(e) => handleClick(rowIdx, colIdx)} />
                    ))}
                </div>
            ))}
        </div>
  );
}