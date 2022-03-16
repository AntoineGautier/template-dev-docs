


# Nomenclature

This provides conventions for variable naming, and for component naming marginally.


## Control points

Damper and valve models
- take as an input
  - `y1` (Boolean) if 2-position, XOR
  - `y` (real, fractional) if modulating
- return
  - `y_actual` (real, fractional) for the position feedback (modulating), XOR
  - `y1_actual` (Boolean, open end switch status) and `y0_actual` (Boolean, closed end switch status)

Fan and pump models
- take as an input
  - `y1` for the on/off command (Boolean, used for constant and variable speed pump/fan VFD Run signal), AND
  - `y` (optional) for the commanded speed (real, fractional)
- return `y1_actual` (Boolean, status)

(See also [command in Glossary](./glossary.md#command).)


::: details
***Still need to clarify*** the use of `u` and `y` in MBL.

- Is it in reference to the control system (as I/O points) or in reference to the modeled component (either the process—for a sensor—or the controls)?
- Is it at all related to control theory as in the diagram below? Obviously not as we would then use `u` for the controller *output* and `e = ysp - y` so something in the `y` domain for the controller *input*.

![control](/img/control.png)
:::

## Order of morphemes

In the CamelCase instance name:

- The first morpheme indicates what the instance represents.

  - For instance a controller `ctl`, a fan `fan`, a coil `coi`

  ::: details

  This is motivated by the naming of

  - quantity variables: we would not use `SupAirT` for the supply air temperature, but rather `TAirSup`,

  - physical connectors: see `port_a`.
  :::

- The suffixes stand for the attributes by order of importance.

  - For instance `coiCoo` for cooling coil, `fanSupDra` for a supply fan in a draw-through configuration.

  - For a quantity

    - the first suffix shall systematically describe the medium (`ChiWat`, `Air`, etc.),
    - the second suffix shall describe the origin of the medium (`ChiWatSup`, `TAirSup`, etc.).

    Exceptions are only allowed if the quantity is a system characteristic for which there is no ambiguity, for instance `dpDamOut_nominal` for the OA damper pressure drop (we don’t mention air) or `dpValCoiCoo` for the cooling coil control valve (we don’t mention CHW).
    Similarly: `TOut` (air implied), `TZon` (air implied), `pBui_rel` (air implied).


All CamelCase morphemes should be used before the first underscore&mdash;such as in `mAirSup_flow_nominal`&mdash;with the exception of the physical connectors where we use `port_aChiWat`.


## Do we allow 3-Letter capital names such as CHW?

***No!***

3-letter capital abbreviations are only allowed&mdash;and encouraged&mdash;in documentation and description strings.

For variable and instance names:

| Rather use    | Instead of |
| ------------- | ------------- |
| ChiWat | CHW  |
| ConWat | CW |
| HeaWat | HHW |
| HotWat | DHW |
| Eco | WSE |
| Hex | HX |
| AirHan | AHU |
| Tow | CT |
| yLoa | PLR |

Tolerated exceptions:

- COP
- VAV


## Fixed position or non-abbreviated forms

- `_nominal`, `_min`, `_max` and `_actual` always at the end

  ::: details

  `min` and `max` are attributes of primitive types in Modelica, same as `nominal`, and should have the same notation, not Min and Max in CamelCase.
  :::

- For design conditions use `_nominal` not `Des`

- `_flow` for rate per unit of time

- `have_`, `is_` or `use_` for a structural parameter, always at the beginning

  ::: details

  Why not `has_`? Because “Does it have?”, same for “Does it use?”, but “Is it?”
  :::

- `_a` and `_b` for inlet and outlet ports.


## Reserved

### Physical quantities

Pressure:

- `p` is used for absolute pressure,
- `p_rel` for relative pressure (duct static, building static, etc.),
- `dp` for a pressure drop across an equipment or a circuit.

Relative humidity: `phi`

From [Buildings.UsersGuide.Conventions](https://simulationresearch.lbl.gov/modelica/releases/v8.1.0/help/Buildings_UsersGuide.html#Buildings.UsersGuide.Conventions):

- Mass fraction
  - Uppercase `X` denotes mass fraction per total mass.
  - Lowercase `x` denotes mass fraction per mass of dry air (absolute humidity).

- `TWetBul` for wet bulb

::: tip
The naming conventions used for variables representing quantities (such as `T` for temperature) should be used in instance names (typically sensors) for the sake of concision.

For instance a sensor for supply air temperature should be named `TAirSup` instead of `senTemAirSup`.
:::

### Various

`Set` for a set point, always as the last morpheme. So `TZonHeaOccSet` not `TZonHeaSetOcc`.

The letter `n` is used to represent a number of something (as opposed to num).

The letter `y` is used  to represent a fractional quantity (speed, opening, load) taking 1 as maximum value, for instance `yLoa` for PLR.

::: tip

  - Prefer `ctl` to `con` for a controller as the latter is too loose: condenser, configuration, etc.

  - Prefer `cfg` to `con` for a configuration.

  - Prefer `lck` to `loc` for lock-out as the latter too loose: local, etc.
:::


##  Legacy exceptions

Mainly for consistency with MSL we allow the following variable names.

- `samplePeriod`
