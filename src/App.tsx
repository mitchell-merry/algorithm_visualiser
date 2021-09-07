import React from 'react';
import './App.css';
import { Grid } from './Grid';

export interface AppProps { }

export interface IAppState {
  hasError: boolean;
}

export class App extends React.Component<AppProps, IAppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error(error);

    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if(this.state.hasError) return <>ERROR!!!!!</>;

    return (
      <div className="App">
          <Grid width={30 } height={20}/>
      </div>
    );
  }
}
