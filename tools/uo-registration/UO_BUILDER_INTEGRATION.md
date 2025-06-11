# Unit Operation Builder Integration Guide

This document explains how to integrate the Unit Operation Builder into your main workflow management application.

## Overview

The UO Builder is a drag-and-drop interface that allows users to create custom Unit Operations with configurable parameters. It consists of:

1. **UI Components**: Modal dialog with drag-and-drop interface
2. **State Management**: React hooks for builder state and drag-and-drop
3. **Data Persistence**: Local storage service for custom UOs
4. **Integration Points**: Button component and registration callbacks

## Integration Steps

### 1. Add the Registration Button to Toolbar

In your main toolbar component (next to "Create Workflow" button):

```tsx
import { UORegistrationButton } from './uo-registration/src/components/UORegistrationButton';

// In your toolbar component
<UORegistrationButton
  onUORegistered={(result) => {
    if (result.success) {
      console.log('UO registered:', result.schema);
      // Update your sidebar component library
      updateSidebarComponents();
    }
  }}
/>
```

### 2. Install Required Dependencies

Add these dependencies to your package.json:

```json
{
  "@mui/x-date-pickers": "^6.19.7",
  "date-fns": "^2.30.0"
}
```

### 3. Update Sidebar to Show Custom UOs

Modify your sidebar component to include custom UOs:

```tsx
import { UORegistrationService } from './uo-registration/src/services/UORegistrationService';

const Sidebar = () => {
  const registrationService = UORegistrationService.getInstance();
  const customUOs = registrationService.getCustomUOs();

  // Add custom UOs to your existing operation nodes
  const allOperationNodes = [
    ...operationNodes, // Your existing nodes
    ...customUOs.map(uo => ({
      type: uo.id,
      label: uo.name,
      description: uo.description,
      category: uo.category,
      isCustom: true,
      parameters: uo.parameters
    }))
  ];

  // Rest of your sidebar logic...
};
```

### 4. Handle Custom UO Nodes in Canvas

When a custom UO is dropped on the canvas:

```tsx
const handleNodeDrop = (nodeType: string) => {
  const registrationService = UORegistrationService.getInstance();
  const customUO = registrationService.getUOById(nodeType);
  
  if (customUO) {
    // Create node with custom UO parameters
    const newNode = {
      id: generateNodeId(),
      type: 'customUO',
      data: {
        label: customUO.name,
        parameters: customUO.parameters,
        schema: customUO
      },
      position: dropPosition
    };
    
    addNode(newNode);
  }
};
```

### 5. Custom UO Node Component

Create a node component for custom UOs:

```tsx
import { ComponentPreview } from './uo-registration/src/components/UOBuilder/ComponentPreview';

const CustomUONode = ({ data }) => {
  const [parameterValues, setParameterValues] = useState({});

  return (
    <div className="custom-uo-node">
      <div className="node-header">
        <h3>{data.label}</h3>
      </div>
      <div className="node-parameters">
        {data.parameters.map(param => (
          <ComponentPreview
            key={param.id}
            component={param}
            interactive={true}
            value={parameterValues[param.id]}
            onChange={(value) => setParameterValues(prev => ({
              ...prev,
              [param.id]: value
            }))}
          />
        ))}
      </div>
    </div>
  );
};
```

## File Structure

```
uo-registration/
├── src/
│   ├── components/
│   │   ├── UOBuilder/
│   │   │   ├── UOBuilderModal.tsx      # Main modal component
│   │   │   ├── UOBuilderHeader.tsx     # Basic info section
│   │   │   ├── ComponentLibrary.tsx    # Right sidebar with components
│   │   │   ├── BuilderCanvas.tsx       # Main drag-drop canvas
│   │   │   ├── ComponentRenderer.tsx   # Individual component renderer
│   │   │   ├── ComponentPreview.tsx    # Component preview
│   │   │   ├── UOPreview.tsx          # Full UO preview
│   │   │   ├── CategorySelector.tsx    # Category selection dialog
│   │   │   └── index.ts               # Export all components
│   │   └── UORegistrationButton.tsx   # Main entry button
│   ├── hooks/
│   │   ├── useUOBuilder.ts            # Builder state management
│   │   └── useDragDrop.ts             # Drag and drop logic
│   ├── services/
│   │   └── UORegistrationService.ts   # Data persistence service
│   ├── types/
│   │   └── UOBuilder.ts               # TypeScript interfaces
│   └── config/
│       └── componentLibrary.ts        # Component library config
```

## Features

### 🎨 Drag & Drop Interface
- Drag components from library to canvas
- Visual feedback during drag operations
- Snap-to-grid positioning
- Delete by dragging to trash

### 🧩 Component Types
- **Text Input**: Single-line text fields
- **Number Input**: Numeric inputs with units and validation
- **Select Dropdown**: Single/multiple selection
- **Boolean Toggle**: Switches and checkboxes
- **Date Picker**: Date and time selection
- **Range Slider**: Min/max range selection
- **Text Area**: Multi-line text input
- **Unit Labels**: Display measurement units
- **Parameter Names**: Editable parameter labels

### 📋 Categories
- Pre-defined categories (Separation, Reaction, etc.)
- Custom category creation
- Color-coded organization
- Icon support

### 🔍 Preview Mode
- Real-time preview of UO interface
- Interactive parameter testing
- Layout validation
- Usage instructions

### 💾 Data Persistence
- Local storage for custom UOs
- Import/export functionality
- Version management
- Validation and error handling

## API Reference

### UORegistrationService

```tsx
const service = UORegistrationService.getInstance();

// Register new UO
const result = await service.registerUO(schema);

// Get all custom UOs
const customUOs = service.getCustomUOs();

// Delete UO
service.deleteUO(uoId);

// Export/Import
const jsonData = service.exportUOs();
service.importUOs(jsonData);
```

### Hooks

```tsx
// Builder state management
const { state, actions, validation, generateSchema } = useUOBuilder();

// Drag and drop
const dragDrop = useDragDrop();
```

## Styling

The components use Material-UI with your existing theme. Custom styles follow the cyber pastel color scheme:

- Primary: Matrix Purple (#8F7FE8)
- Accent: Cyber Teal (#41C4A9)
- Background: Light grays and whites
- Borders: Subtle shadows and rounded corners

## Error Handling

The system includes comprehensive validation:
- Required field validation
- Component-specific validation
- Real-time error display
- User-friendly error messages

## Future Enhancements

1. **Backend Integration**: Replace localStorage with API calls
2. **Collaboration**: Multi-user editing and sharing
3. **Templates**: Pre-built UO templates
4. **Advanced Components**: Charts, tables, file uploads
5. **Workflow Integration**: Direct connection to workflow nodes
6. **Version Control**: UO versioning and change tracking
