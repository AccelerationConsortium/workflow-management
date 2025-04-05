use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use std::collections::HashMap;
use crate::{DeviceExecutor, SDLDeviceExecutor, DeviceState, DeviceStatus, DeviceError};

#[pyclass]
pub struct PyDeviceExecutor {
    inner: SDLDeviceExecutor,
}

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> Self {
        PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(err.to_string())
    }
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    fn new() -> Self {
        Self {
            inner: SDLDeviceExecutor::new(),
        }
    }
    
    fn initialize(&mut self, py: Python) -> PyResult<()> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(self.inner.initialize())?;
        Ok(())
    }
    
    fn execute(&mut self, py: Python, operation: &str, params: Option<&PyDict>) -> PyResult<Py<PyAny>> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        
        let mut rust_params = HashMap::new();
        if let Some(dict) = params {
            for (key, value) in dict.iter() {
                let key = key.extract::<String>()?;
                rust_params.insert(key, serde_json::to_value(value.to_string())?);
            }
        }
        
        let result = rt.block_on(self.inner.execute(operation, rust_params))?;
        
        Ok(serde_json::to_string(&result)?.into_py(py))
    }
    
    fn get_status(&self, py: Python) -> PyResult<Py<PyAny>> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let state = rt.block_on(self.inner.get_status())?;
        
        let dict = PyDict::new(py);
        dict.set_item("status", state.status.to_string())?;
        dict.set_item("parameters", serde_json::to_string(&state.parameters)?)?;
        
        Ok(dict.into())
    }
    
    fn reset(&mut self, py: Python) -> PyResult<()> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(self.inner.reset())?;
        Ok(())
    }
}

pub fn init_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
