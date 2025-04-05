use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use std::collections::HashMap;
use crate::{DeviceExecutor, SDLDeviceExecutor, DeviceState, DeviceStatus};

#[pyclass]
struct PySDLDeviceExecutor {
    inner: SDLDeviceExecutor,
}

#[pymethods]
impl PySDLDeviceExecutor {
    #[new]
    fn new() -> Self {
        Self {
            inner: SDLDeviceExecutor::new(),
        }
    }

    fn initialize(&mut self) -> PyResult<()> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(self.inner.initialize())?;
        Ok(())
    }

    fn execute(&mut self, operation: &str, params: &PyDict) -> PyResult<PyObject> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        
        // 转换 Python 字典到 Rust HashMap
        let mut rust_params = HashMap::new();
        for (key, value) in params.iter() {
            let key = key.extract::<String>()?;
            let value = value.extract::<PyObject>()?;
            rust_params.insert(key, serde_json::to_value(value)?);
        }
        
        // 执行操作
        let result = rt.block_on(self.inner.execute(operation, rust_params))?;
        
        // 转换结果回 Python 对象
        Python::with_gil(|py| {
            Ok(serde_json::to_string(&result)?.into_py(py))
        })
    }

    fn get_status(&self) -> PyResult<PyObject> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let state = rt.block_on(self.inner.get_status())?;
        
        Python::with_gil(|py| {
            let dict = PyDict::new(py);
            dict.set_item("status", state.status.to_string())?;
            dict.set_item("parameters", serde_json::to_string(&state.parameters)?)?;
            Ok(dict.into())
        })
    }

    fn reset(&mut self) -> PyResult<()> {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(self.inner.reset())?;
        Ok(())
    }
}

#[pymodule]
fn device_executor(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PySDLDeviceExecutor>()?;
    Ok(())
} 
