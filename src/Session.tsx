import React, { useReducer, useMemo, useEffect, useCallback } from 'react';

export interface CLUISessionItem {
  session?: CLUISession;
}

export interface CLUISession {
  next: () => any;
  reset: () => any;
  insert: (...els: Array<React.ReactElement>) => any;
  currentIndex: number;
}

interface State {
  currentIndex: number;
  nodes: Array<React.ReactElement | number>;
}

type Action =
  | {
      type: 'SET_INDEX';
    }
  | {
      type: 'RESET';
    }
  | {
      type: 'NEXT';
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'NEXT':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    case 'RESET':
      return {
        ...state,
        currentIndex: 0,
      };
    default:
      return state;
  }
};

interface Props extends CLUISessionItem {
  onDone?: () => any;
  children: React.ReactNode;
  initialIndex?: number;
}

const Session = (props: Props) => {
  const children = useMemo(
    () => React.Children.toArray(props.children).filter(React.isValidElement),
    [props.children],
  );

  const [state, dispatch] = useReducer(reducer, {
    currentIndex: props.initialIndex || 0,
    nodes: children.map((_, index) => index),
  });

  const nodes = useMemo(
    () =>
      state.nodes.reduce((acc: Array<React.ReactElement>, node) => {
        if (typeof node !== 'number') {
          acc.push(node);
        } else if (typeof node === 'number' && children[node]) {
          acc.push(children[node]);
        }

        return acc;
      }, []),
    [state, children],
  );

  const currentNodes = useMemo(() => nodes.slice(0, state.currentIndex + 1), [
    nodes,
    state.currentIndex,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const next = useCallback(() => {
    if (currentNodes.length < nodes.length) {
      dispatch({ type: 'NEXT' });

      return;
    }

    if (props.onDone) {
      props.onDone();
    }

    if (props.session) {
      props.session.next();
    }
  }, [dispatch, props.session, props.onDone, currentNodes, nodes]);

  const session = useMemo<CLUISession>(
    () => ({ next, reset, currentIndex: state.currentIndex }),
    [next, state.currentIndex],
  );

  return (
    <>
      {React.Children.map(currentNodes, element =>
        React.cloneElement(element, { session }),
      )}
    </>
  );
};

export default Session;