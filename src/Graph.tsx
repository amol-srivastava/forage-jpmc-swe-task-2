import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
  setAttribute: (name: string, value: string) => void;
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
  // Get the perspective-viewer element from the DOM
  const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

  // Define the schema for the perspective table
  const schema = {
    stock: 'string',
    top_ask_price: 'float',
    top_bid_price: 'float',
    timestamp: 'date',
  };

  // Initialize the perspective worker and table
  if (window.perspective && window.perspective.worker()) {
    this.table = window.perspective.worker().table(schema);
  }

  if (this.table) {
    // Load the perspective table into the perspective-viewer
    elem.load(this.table);

    // Configure the perspective-viewer attributes
    elem.setAttribute('view', 'y_line');
    elem.setAttribute('column-pivots', '["stock"]');
    elem.setAttribute('row-pivots', '["timestamp"]');
    elem.setAttribute('columns', '["top_ask_price"]');
    elem.setAttribute('aggregates', JSON.stringify({
      stock: 'distinct count',
      top_ask_price: 'avg',
      top_bid_price: 'avg',
      timestamp: 'distinct count'
    }));
  }
}


  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
