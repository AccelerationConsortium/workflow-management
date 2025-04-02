Primitives
'''
yaml

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

primitive:
  name: CV_activation
  description: |
    Perform cyclic voltammetry activation on the electrode.
    Used to activate electrocatalyst by repeated potential sweeping.

  inputs:
    - name: working_electrode
      type: electrode
    - name: electrolyte
      type: solution

  parameters:
    scan_rate:
      type: float
      unit: mV/s
      default: 50
    voltage_range:
      type: list
      unit: V
      example: [-0.2, 0.8]
    cycles:
      type: int
      default: 10

  outputs:
    - name: cv_curve
      type: time_series
    - name: activation_status
      type: enum
      values: [success, failed, warning]

  thresholds:
    current_limit:
      type: float
      unit: mA
      max: 100
    voltage_drift:
      type: float
      unit: V
      max: 0.05

  metadata:
    instrument: Biologic_SP200
    control_interface: python-api


UO

unit_operation: PerformanceCharacterization

description: >
  Characterize the performance of an electrochemically activated electrode.
  Includes stability, surface area, redox behavior, and kinetic performance.

includes:
  - primitive: CV_stability
  - primitive: PEIS
    alias: PEIS_before
  - primitive: LSV
  - primitive: CV_redox
  - primitive: PEIS
    alias: PEIS_after
  - primitive: CVA
    alias: CVA_after

inputs:
  - name: activated_electrode
    type: Electrode

outputs:
  - name: tafel_slope
    type: float
    unit: mV/dec
  - name: degradation_ratio
    type: float
    unit: "%"
  - name: redox_profile
    type: Dict
  - name: rct_before
    type: float
  - name: rct_after
    type: float
  - name: surface_area_after
    type: float

notes:
  execution_mode: sequential
  store_raw_data: true
  allow_subselection: true


unit_operation:
  name: Activation
  description: |
    Activate the deposited electrode using cyclic voltammetry.
    Followed by surface area estimation and redox state confirmation.

  includes: 
    - CV_activation
    - CVA
    - CV_redox

  inputs:
    - name: deposited_electrode
      type: electrode
    - name: electrolyte
      type: solution

  outputs:
    - name: activated_electrode
      type: electrode
    - name: ECSA
      type: float
      unit: cm^2
    - name: redox_profile
      type: dict
      example: {peak1: 0.45, peak2: 0.71}

  success_criteria:
    ECSA:
      min: 0.2
    redox_profile:
      required_peaks: 2


