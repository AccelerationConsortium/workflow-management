Primitives

 primitive: PEIS

description: >
  Perform Potentiostatic Electrochemical Impedance Spectroscopy to characterize
  solution resistance (Rs) and charge transfer resistance (Rct) of an electrode in electrolyte.

inputs:
  - name: working_electrode
    type: Electrode
  - name: electrolyte
    type: Solution

parameters:
  - name: ac_amplitude
    type: float
    unit: mV
    default: 10
  - name: frequency_range
    type: list
    unit: Hz
    example: [0.1, 100000]

outputs:
  - name: rs
    type: float
    unit: Ohm
  - name: rct
    type: float
    unit: Ohm
  - name: impedance_curve
    type: DataFrame
    description: Full Nyquist plot data

thresholds:
  - name: max_rs
    value: 50
    logic: "<"
  - name: max_rct
    value: 200
    logic: "<"

metadata:
  device: Biologic SP-200
  operator: system
  log: true
