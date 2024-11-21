import React from 'react';
import { dummyOperations } from '../../data/dummyOperations';
import styles from './OperationSidebar.module.css';

const OperationSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={styles.sidebar}>
      <h3>Operations</h3>
      {dummyOperations.map((operation) => (
        <div
          key={operation.id}
          className={styles.operationItem}
          draggable
          onDragStart={(e) => onDragStart(e, operation.id)}
        >
          {operation.name}
        </div>
      ))}
    </div>
  );
};

export default OperationSidebar; 