import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  UnitOperationFormData,
  Laboratory,
  CommunicationProtocol,
  DeviceConnection,
  CalibrationInfo,
  MaintenanceRecord,
  DeviceMonitoring
} from '../../types/UnitOperation';

interface SpecificUnitOperationFormProps {
  onSubmit: (data: UnitOperationFormData) => void;
  genericUnitOperation?: any; // 从父组件传入的通用UO数据
}

const SpecificUnitOperationForm: React.FC<SpecificUnitOperationFormProps> = ({ onSubmit, genericUnitOperation }) => {
  const [activeTab, setActiveTab] = useState(0);

  const { control, handleSubmit, formState: { errors } } = useForm<UnitOperationFormData>({
    defaultValues: {
      name: '',
      description: '',
      laboratoryId: undefined,
      location: '',
      deviceConnection: {
        protocol: CommunicationProtocol.MODBUS,
        address: '',
        port: undefined,
        timeout: 1000,
        retries: 3
      },
      calibrationInfo: {
        lastCalibrationDate: '',
        nextCalibrationDue: '',
        calibrationProcedure: '',
      },
      maintenanceRecords: [],
      monitoring: {
        parameters: [],
        alarmSettings: []
      },
      controlCommands: [],
      errorHandling: [],
      safetyMeasures: []
    }
  });

  // 使用 useFieldArray 管理动态字段
  const { fields: monitoringParams, append: appendMonitoringParam, remove: removeMonitoringParam } = useFieldArray({
    control,
    name: 'monitoring.parameters'
  });

  const { fields: alarmSettings, append: appendAlarmSetting, remove: removeAlarmSetting } = useFieldArray({
    control,
    name: 'monitoring.alarmSettings'
  });

  const { fields: maintenanceRecords, append: appendMaintenanceRecord, remove: removeMaintenanceRecord } = useFieldArray({
    control,
    name: 'maintenanceRecords'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="form sections">
          <Tab label="Basic Information" />
          <Tab label="Device Connection" />
          <Tab label="Monitoring & Alarms" />
          <Tab label="Maintenance & Calibration" />
          <Tab label="Safety & Error Handling" />
        </Tabs>

        {/* Basic Information Tab */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Device Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="laboratoryId"
                  control={control}
                  rules={{ required: 'Laboratory is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.laboratoryId}>
                      <InputLabel>Laboratory</InputLabel>
                      <Select {...field} label="Laboratory">
                        {Object.values(Laboratory).map((lab) => (
                          <MenuItem key={lab} value={lab}>
                            {lab}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.laboratoryId && (
                        <FormHelperText>{errors.laboratoryId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  rules={{ required: 'Location is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location in Lab"
                      fullWidth
                      error={!!errors.location}
                      helperText={errors.location?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Device Connection Tab */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Communication Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="deviceConnection.protocol"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Protocol</InputLabel>
                      <Select {...field} label="Protocol">
                        {Object.values(CommunicationProtocol).map((protocol) => (
                          <MenuItem key={protocol} value={protocol}>
                            {protocol}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="deviceConnection.address"
                  control={control}
                  rules={{ required: 'Address is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Device Address"
                      fullWidth
                      error={!!errors.deviceConnection?.address}
                      helperText={errors.deviceConnection?.address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="deviceConnection.port"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Port"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="deviceConnection.timeout"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Timeout (ms)"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="deviceConnection.retries"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Retries"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Monitoring & Alarms Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Monitoring Parameters</Typography>
            {monitoringParams.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`monitoring.parameters.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Parameter Name"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    name={`monitoring.parameters.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Type"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    name={`monitoring.parameters.${index}.unit`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Unit"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller
                        name={`monitoring.parameters.${index}.normalRange.min`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Min"
                            type="number"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name={`monitoring.parameters.${index}.normalRange.max`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Max"
                            type="number"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton onClick={() => removeMonitoringParam(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => appendMonitoringParam({
                name: '',
                type: '',
                unit: '',
                normalRange: { min: 0, max: 0 }
              })}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Parameter
            </Button>

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>Alarm Settings</Typography>
            {alarmSettings.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`monitoring.alarmSettings.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Alarm Name"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`monitoring.alarmSettings.${index}.condition`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Condition"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`monitoring.alarmSettings.${index}.severity`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>Severity</InputLabel>
                        <Select {...field} label="Severity">
                          <MenuItem value="info">Info</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    name={`monitoring.alarmSettings.${index}.action`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Action"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton onClick={() => removeAlarmSetting(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => appendAlarmSetting({
                name: '',
                condition: '',
                severity: 'warning',
                action: ''
              })}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Alarm
            </Button>
          </Paper>
        )}

        {/* Maintenance & Calibration Tab */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Calibration Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="calibrationInfo.lastCalibrationDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Calibration Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="calibrationInfo.nextCalibrationDue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Next Calibration Due"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="calibrationInfo.calibrationProcedure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Calibration Procedure"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>Maintenance Records</Typography>
            {maintenanceRecords.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} md={2}>
                  <Controller
                    name={`maintenanceRecords.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>Type</InputLabel>
                        <Select {...field} label="Type">
                          <MenuItem value="preventive">Preventive</MenuItem>
                          <MenuItem value="corrective">Corrective</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    name={`maintenanceRecords.${index}.date`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`maintenanceRecords.${index}.performedBy`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Performed By"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`maintenanceRecords.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton onClick={() => removeMaintenanceRecord(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => appendMaintenanceRecord({
                type: 'preventive',
                date: '',
                performedBy: '',
                description: ''
              })}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Maintenance Record
            </Button>
          </Paper>
        )}

        {/* Safety & Error Handling Tab */}
        {activeTab === 4 && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Safety Measures</Typography>
            <Controller
              name="safetyMeasures"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Safety Procedures"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter safety procedures and emergency protocols..."
                />
              )}
            />

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>Error Handling</Typography>
            <Controller
              name="errorHandling"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Error Handling Procedures"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter error codes, troubleshooting steps, and recovery procedures..."
                />
              )}
            />
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Save Specific UO
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default SpecificUnitOperationForm; 
