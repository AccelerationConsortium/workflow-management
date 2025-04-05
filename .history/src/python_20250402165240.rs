use pyo3::prelude::*;
use pyo3::types::{PyDict};
use serde_json;
use tokio::runtime::Runtime;

use crate::{DeviceExecutor, SDLDeviceExecutor, DeviceError, DeviceConfig};

#[pyclass]
pub struct PyDeviceExecutor {
    inner: SDLDeviceExecutor,
    runtime: Runtime,
}

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> Self {
        match err {
            DeviceError::NotInitialized { device_id } => {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                    format!("设备未初始化: {}", device_id)
                )
            }
            DeviceError::DeviceBusy { device_id, operation, .. } => {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                    format!("设备忙: {} 正在执行 {}", device_id, operation)
                )
            }
            DeviceError::InvalidParameter { reason, parameter, .. } => {
                PyErr::new::<pyo3::exceptions::PyValueError, _>(
                    format!("无效参数 {}: {}", parameter, reason)
                )
            }
            DeviceError::DeviceError { device_id, message, .. } => {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                    format!("设备错误 {}: {}", device_id, message)
                )
            }
            DeviceError::Timeout { device_id, operation, .. } => {
                PyErr::new::<pyo3::exceptions::PyTimeoutError, _>(
                    format!("操作超时: {} {}", device_id, operation)
                )
            }
            DeviceError::DeviceNotFound { device_id } => {
                PyErr::new::<pyo3::exceptions::PyKeyError, _>(
                    format!("设备不存在: {}", device_id)
                )
            }
        }
    }
}

#[pymethods]
impl PyDeviceExecutor {
    #[new]
    fn new() -> PyResult<Self> {
        Ok(Self {
            inner: SDLDeviceExecutor::new_with_config(DeviceConfig::default()),
            runtime: Runtime::new().map_err(|e| 
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
            )?,
        })
    }

    fn initialize(&mut self, _py: Python) -> PyResult<()> {
        self.runtime.block_on(self.inner.initialize())?;
        Ok(())
    }

    fn execute(&self, py: Python, operation: String, params: Option<&PyDict>) -> PyResult<String> {
        let mut rust_params = std::collections::HashMap::new();
        if let Some(dict) = params {
            for (key, value) in dict.iter() {
                let key = key.extract::<String>()?;
                let value = serde_json::to_value(value.extract::<String>()?)?;
                rust_params.insert(key, value);
            }
        }

        let result = self.runtime.block_on(self.inner.execute(&operation, rust_params))?;
        serde_json::to_string(&result).map_err(|e| e.into())
    }

    fn get_status(&self, py: Python) -> PyResult<PyObject> {
        let dict = PyDict::new(py);
        let state = self.inner.get_status();
        dict.set_item("status", state.status.to_string())?;
        dict.set_item("parameters", serde_json::to_string(&state.parameters)?)?;
        Ok(dict.into())
    }

    fn reset(&mut self, _py: Python) -> PyResult<()> {
        self.runtime.block_on(self.inner.reset())?;
        Ok(())
    }
}

pub fn init_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
