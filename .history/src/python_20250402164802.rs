use pyo3::prelude::*;
use pyo3::types::{PyDict};
use serde_json;

use crate::{DeviceExecutor, SDLDeviceExecutor, DeviceError};

#[pyclass]
pub struct PyDeviceExecutor {
    inner: SDLDeviceExecutor,
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    fn new() -> Self {
        Self {
            inner: SDLDeviceExecutor::new_with_config(Default::default()),
        }
    }

    fn initialize(&mut self, _py: Python) -> PyResult<()> {
        self.inner.initialize().map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
        })
    }

    fn execute(&mut self, py: Python, operation: String, params: Option<&PyDict>) -> PyResult<String> {
        let mut rust_params = std::collections::HashMap::new();
        if let Some(dict) = params {
            for (key, value) in dict.iter() {
                let key = key.extract::<String>()?;
                let value = value.to_string();
                rust_params.insert(key, serde_json::Value::String(value));
            }
        }

        let result = self.inner.execute(&operation, rust_params).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
        })?;

        serde_json::to_string(&result).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
        })
    }

    fn get_status(&self, py: Python) -> PyResult<PyObject> {
        let dict = PyDict::new(py);
        let state = self.inner.get_status();
        dict.set_item("status", state.status.to_string())?;
        dict.set_item("parameters", serde_json::to_string(&state.parameters).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
        })?)?;
        Ok(dict.into())
    }

    fn reset(&mut self, _py: Python) -> PyResult<()> {
        self.inner.reset().map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
        })
    }
} 
