use pyo3::prelude::*;
use pyo3::types::PyDict;
use serde_json::Value;

use crate::{DeviceExecutor, DeviceError, devices::create_device};

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> PyErr {
        PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(err.to_string())
    }
}

#[pyclass]
pub struct PyDeviceExecutor {
    executor: Box<dyn DeviceExecutor>,
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    pub fn new(device_type: &str, device_id: &str) -> PyResult<Self> {
        let executor = create_device(device_type, device_id)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        Ok(Self { executor })
    }

    pub fn initialize(&self, config: Option<&PyDict>) -> PyResult<()> {
        let config_value = match config {
            Some(dict) => {
                let value = Python::with_gil(|py| {
                    let json_str = pyo3::types::PyString::new(py, &dict.to_string());
                    serde_json::from_str::<Value>(&json_str.to_string())
                        .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
                })?;
                Some(value)
            }
            None => None,
        };

        Python::with_gil(|_| {
            futures::executor::block_on(self.executor.initialize(config_value))
        })?;
        Ok(())
    }

    pub fn execute(&self, operation: &str, params: Option<&PyDict>) -> PyResult<String> {
        let params_value = match params {
            Some(dict) => {
                let value = Python::with_gil(|py| {
                    let json_str = pyo3::types::PyString::new(py, &dict.to_string());
                    serde_json::from_str::<Value>(&json_str.to_string())
                        .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
                })?;
                Some(value)
            }
            None => None,
        };

        let result = Python::with_gil(|_| {
            futures::executor::block_on(self.executor.execute(operation, params_value))
        })?;

        serde_json::to_string(&result)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    pub fn get_status(&self) -> PyResult<String> {
        let status = Python::with_gil(|_| {
            futures::executor::block_on(self.executor.get_status())
        })?;

        serde_json::to_string(&status)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }

    pub fn reset(&self) -> PyResult<()> {
        Python::with_gil(|_| {
            futures::executor::block_on(self.executor.reset())
        })?;
        Ok(())
    }
}

pub fn init_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
