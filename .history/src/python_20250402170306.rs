use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use serde_json::Value;
use std::collections::HashMap;

use crate::{DeviceExecutor, DeviceError, SDLDeviceExecutor};

#[pyclass]
pub struct PyDeviceExecutor {
    inner: SDLDeviceExecutor,
}

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> PyErr {
        PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(err.message)
    }
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    fn new(device_id: String) -> Self {
        Self {
            inner: SDLDeviceExecutor::new(device_id),
        }
    }

    fn initialize(&mut self, py: Python, config: Option<&PyDict>) -> PyResult<()> {
        let config_value = match config {
            Some(dict) => dict.to_object(py).extract(py)?,
            None => Value::Null,
        };
        
        futures::executor::block_on(self.inner.initialize(config_value))?;
        Ok(())
    }

    fn execute(&mut self, py: Python, operation: &str, params: Option<&PyDict>) -> PyResult<String> {
        let params_map = match params {
            Some(dict) => {
                let mut map = HashMap::new();
                for (key, value) in dict.iter() {
                    let key = key.extract::<String>()?;
                    let value = value.to_object(py).extract(py)?;
                    map.insert(key, value);
                }
                map
            }
            None => HashMap::new(),
        };

        let result = futures::executor::block_on(self.inner.execute(operation, params_map))?;
        Ok(serde_json::to_string(&result)?)
    }

    fn get_status(&self, py: Python) -> PyResult<String> {
        let status = futures::executor::block_on(self.inner.get_status())?;
        Ok(serde_json::to_string(&status)?)
    }

    fn reset(&mut self, py: Python) -> PyResult<()> {
        futures::executor::block_on(self.inner.reset())?;
        Ok(())
    }
}

pub fn init_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
