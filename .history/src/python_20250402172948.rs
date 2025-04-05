use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use serde_json::Value;
use std::collections::HashMap;

use crate::{
    DeviceError,
    DeviceExecutor,
    DeviceState,
    devices::create_device,
};

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> PyErr {
        pyo3::exceptions::PyRuntimeError::new_err(err.to_string())
    }
}

impl From<serde_json::Error> for PyErr {
    fn from(err: serde_json::Error) -> PyErr {
        pyo3::exceptions::PyValueError::new_err(err.to_string())
    }
}

#[pyclass]
pub struct PyDeviceExecutor {
    inner: Box<dyn DeviceExecutor>,
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    fn new(device_type: String, device_id: String, config: &PyDict) -> PyResult<Self> {
        let config_value: Value = config.extract()?;
        let device = create_device(&device_type, device_id, config_value)?;
        Ok(Self { inner: device })
    }

    fn initialize(&mut self, config: Option<&PyDict>) -> PyResult<()> {
        let config_value = config.map(|c| c.extract()).transpose()?;
        futures::executor::block_on(self.inner.initialize(config_value))?;
        Ok(())
    }

    fn execute(&mut self, operation: String, params: Option<&PyDict>) -> PyResult<Value> {
        let params_value = params.map(|p| p.extract()).transpose()?;
        let result = futures::executor::block_on(self.inner.execute(&operation, params_value))?;
        Ok(result)
    }

    fn get_status(&self) -> PyResult<Value> {
        let state = futures::executor::block_on(self.inner.get_status())?;
        Ok(serde_json::to_value(state)?)
    }

    fn reset(&mut self) -> PyResult<()> {
        futures::executor::block_on(self.inner.reset())?;
        Ok(())
    }
}

#[pymodule]
fn device_manager(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
