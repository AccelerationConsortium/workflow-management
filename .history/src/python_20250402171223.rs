use pyo3::prelude::*;
use pyo3::types::{PyDict, PyString};
use serde_json::Value;

use crate::{
    DeviceError,
    DeviceExecutor,
    DeviceState,
    devices::create_device,
};

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
        let device = create_device(device_type, device_id)?;
        Ok(Self { executor: device })
    }

    pub fn initialize(&self, config: Option<&PyDict>) -> PyResult<()> {
        let config = config.map(|dict| {
            Python::with_gil(|py| -> PyResult<Value> {
                let value = dict.call_method0(py, "copy")?;
                let json_str = value.call_method0(py, "__str__")?;
                let json_str = json_str.extract::<String>(py)?;
                Ok(serde_json::from_str(&json_str)?)
            })
        }).transpose()?;

        Python::with_gil(|_| {
            futures::executor::block_on(self.executor.initialize(config))?;
            Ok(())
        })
    }

    pub fn execute(&self, operation: &str, params: Option<&PyDict>) -> PyResult<PyObject> {
        let params = params.map(|dict| {
            Python::with_gil(|py| -> PyResult<Value> {
                let value = dict.call_method0(py, "copy")?;
                let json_str = value.call_method0(py, "__str__")?;
                let json_str = json_str.extract::<String>(py)?;
                Ok(serde_json::from_str(&json_str)?)
            })
        }).transpose()?;

        Python::with_gil(|py| {
            let result = futures::executor::block_on(self.executor.execute(operation, params))?;
            Ok(serde_json::to_string(&result)?.into_py(py))
        })
    }

    pub fn get_status(&self) -> PyResult<PyObject> {
        Python::with_gil(|py| {
            let status = futures::executor::block_on(self.executor.get_status())?;
            Ok(serde_json::to_string(&status)?.into_py(py))
        })
    }

    pub fn reset(&self) -> PyResult<()> {
        Python::with_gil(|_| {
            futures::executor::block_on(self.executor.reset())?;
            Ok(())
        })
    }
}

#[pymodule]
fn device_manager(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyDeviceExecutor>()?;
    Ok(())
} 
