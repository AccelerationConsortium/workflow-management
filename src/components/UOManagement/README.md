# UO Management System - User Guide

## 🎯 Overview

The UO Management System provides users with comprehensive tools to manage their custom Unit Operations (UOs), including the ability to safely delete UOs that are no longer needed.

## 🚀 Features

### 1. **UO Management Interface**
- View all registered custom UOs in a table format
- Search and filter UOs by name, category, or description
- Batch selection and operations
- Detailed UO information display

### 2. **Safe Deletion System**
- **Single UO Deletion**: Delete individual UOs with confirmation
- **Batch Deletion**: Select and delete multiple UOs at once
- **Safety Checks**: Confirmation dialogs prevent accidental deletion
- **Usage Validation**: Future enhancement to check if UO is in use

### 3. **Multiple Access Methods**
- **Toolbar Button**: "Manage UOs" button in the main toolbar
- **Sidebar Right-Click**: Right-click on custom UOs in sidebar for quick actions
- **Management Modal**: Comprehensive interface for all UO operations

## 📋 How to Delete UOs

### Method 1: Using the Management Interface

1. **Open UO Management**
   - Click the "Manage UOs" button in the main toolbar (coral red button with settings icon)

2. **Select UOs to Delete**
   - **Single Selection**: Click the checkbox next to the UO you want to delete
   - **Multiple Selection**: Select multiple UOs using checkboxes
   - **Select All**: Use the "Select All" button to select all visible UOs

3. **Delete Selected UOs**
   - Click the "Delete Selected (X)" button in the toolbar
   - Review the confirmation dialog showing all UOs to be deleted
   - Click "Delete X UOs" to confirm

4. **Individual UO Deletion**
   - Click the red delete icon (🗑️) in the Actions column for any UO
   - Confirm deletion in the dialog

### Method 2: Sidebar Right-Click (Quick Delete)

1. **Right-Click on Custom UO**
   - In the sidebar, right-click on any custom UO (marked with "Custom" chip)
   - Select "Delete UO" from the context menu

2. **Confirm Deletion**
   - Review the UO details in the confirmation dialog
   - Click "Delete UO" to confirm

## 🔍 Search and Filter

- **Search Box**: Type to search by UO name, description, or category
- **Real-time Filtering**: Results update as you type
- **Clear Search**: Click the X button to clear search terms

## ⚠️ Safety Features

### Confirmation Dialogs
- **Detailed Information**: Shows UO name, category, description, and creation date
- **Parameter Count**: Displays number of parameters in each UO
- **Warning Messages**: Clear warnings about irreversible actions

### Future Enhancements
- **Usage Detection**: Check if UO is being used in active workflows
- **Backup Suggestions**: Recommend exporting UOs before deletion
- **Dependency Analysis**: Show relationships with other UOs

## 🎨 User Interface

### Management Modal Features
- **Responsive Design**: Works on different screen sizes
- **Sortable Columns**: Click column headers to sort (future enhancement)
- **Status Indicators**: Visual feedback for all operations
- **Snackbar Notifications**: Success/error messages

### Visual Indicators
- **Custom UO Badge**: Purple "Custom" chip identifies user-created UOs
- **Category Colors**: Color-coded category chips for easy identification
- **Selection State**: Clear visual feedback for selected items

## 🔧 Technical Details

### Data Persistence
- **Local Storage**: UOs are stored in browser localStorage
- **Real-time Updates**: All components automatically sync when UOs change
- **Service Layer**: Centralized UO management through `customUOService`

### Error Handling
- **Graceful Failures**: Proper error messages for failed operations
- **Rollback Support**: Failed batch operations show partial success
- **Validation**: Input validation prevents invalid operations

## 📝 Best Practices

### Before Deleting UOs
1. **Export Backup**: Consider exporting your UOs as JSON backup
2. **Check Usage**: Manually verify the UO isn't used in important workflows
3. **Document Dependencies**: Note any workflows that might be affected

### Batch Operations
1. **Start Small**: Test with a few UOs before large batch operations
2. **Review Selection**: Double-check your selection before confirming
3. **Monitor Results**: Check success/failure messages after batch operations

## 🚨 Important Notes

- **Irreversible Action**: Deleted UOs cannot be recovered
- **Workflow Impact**: Workflows using deleted UOs may become invalid
- **Local Storage**: UOs are stored locally per browser/domain
- **No Cloud Sync**: Deletions only affect the current browser session

## 🔮 Future Enhancements

### Planned Features
- **Workflow Scanning**: Automatic detection of UO usage in workflows
- **Soft Delete**: Move UOs to trash before permanent deletion
- **Export/Import**: Backup and restore UO collections
- **Version Control**: Track UO changes and allow rollback
- **Cloud Sync**: Synchronize UOs across devices

### Advanced Management
- **Categories Management**: Create and manage custom categories
- **Bulk Edit**: Modify multiple UOs simultaneously
- **Templates**: Create UO templates for common patterns
- **Analytics**: Usage statistics and optimization suggestions

## 💡 Tips

- Use the search function to quickly find specific UOs
- Right-click method is fastest for single UO deletion
- Management interface is best for reviewing and batch operations
- Always read confirmation dialogs carefully
- Consider the impact on existing workflows before deletion

---

**Need Help?** If you encounter any issues with UO management, check the browser console for error messages or contact support.
