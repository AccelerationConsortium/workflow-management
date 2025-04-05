use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use serde_json::Value;
use std::collections::HashMap;

use crate::{DeviceExecutor, DeviceError, SDLDeviceExecutor};

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> PyErr {
        PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(err.to_string())
    }
}

impl From<serde_json::Error> for PyErr {
    fn from(err: serde_json::Error) -> PyErr {
        PyErr::new::<pyo3::exceptions::PyValueError, _>(err.to_string())
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
        let executor = crate::devices::create_device(device_type, device_id)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        Ok(Self { executor })
    }

    pub fn initialize(&self, config: Option<&PyDict>) -> PyResult<()> {
        let config_value = config.map(|dict| {
            Python::with_gil(|py| {
                dict.extract::<Value>()
                    .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
            })
        }).transpose()?;

        Python::with_gil(|_| {
            futures::executor::block_on(self.executor.initialize(config_value))
        })?;
        Ok(())
    }

    pub fn execute(&self, operation: &str, params: Option<&PyDict>) -> PyResult<String> {
        let params_value = params.map(|dict| {
            Python::with_gil(|py| {
                dict.extract::<Value>()
                    .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
            })
        }).transpose()?;

        let result = Python::with_gil(|_| {
            futures::executor::block_on(self.executor.execute(operation, params_value))
        })?;

        serde_json::to_string(&result).map_err(Into::into)
    }

    pub fn get_status(&self) -> PyResult<String> {
        let status = Python::with_gil(|_| {
            futures::executor::block_on(self.executor.get_status())
        })?;

        serde_json::to_string(&status).map_err(Into::into)
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
