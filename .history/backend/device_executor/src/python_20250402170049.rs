use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use serde_json::Value;
use crate::{DeviceExecutor, DeviceError};

impl From<serde_json::Error> for PyErr {
    fn from(err: serde_json::Error) -> Self {
        PyErr::new::<pyo3::exceptions::PyValueError, _>(err.to_string())
    }
}

impl From<DeviceError> for PyErr {
    fn from(err: DeviceError) -> Self {
        PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(err.message)
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
        let config_value: Value = Python::with_gil(|py| {
            config.to_object(py).extract(py)
        })?;
        
        let device_config = serde_json::from_value(config_value)?;
        let device = crate::create_device(&device_type, device_id, device_config)?;
        
        Ok(Self { inner: device })
    }

    fn initialize(&mut self) -> PyResult<()> {
        Python::with_gil(|_py| {
            futures::executor::block_on(self.inner.initialize())?;
            Ok(())
        })
    }

    fn execute(&mut self, operation: String, params: &PyDict) -> PyResult<String> {
        Python::with_gil(|py| {
            let params_value: Value = params.to_object(py).extract(py)?;
            let params_map = params_value.as_object()
                .ok_or_else(|| PyErr::new::<pyo3::exceptions::PyValueError, _>("参数必须是字典"))?
                .clone();
            
            let result = futures::executor::block_on(self.inner.execute(&operation, params_map))?;
            Ok(serde_json::to_string(&result)?)
        })
    }

    fn get_status(&self) -> PyResult<String> {
        Python::with_gil(|_py| {
            let state = futures::executor::block_on(self.inner.get_status())?;
            Ok(serde_json::to_string(&state)?)
        })
    }

    fn reset(&mut self) -> PyResult<()> {
        Python::with_gil(|_py| {
            futures::executor::block_on(self.inner.reset())?;
            Ok(())
        })
    }
}

pub fn init_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
