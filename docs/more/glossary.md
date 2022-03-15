---
sidebar: auto
sidebarDepth: 2
---

# Glossary


### Source, load

We adopt the definitions from [Guideline 36](./references.md#ashrae-g36) §5.1.19.1.

> A component is a “source” if it provides resources to a downstream component, such as a chiller providing chilled water (CHW) to an AHU.
>
> A component is a “load” if it receives resources from an upstream component, such as an AHU that receives CHW from a chiller.
>
> The same component may be both a load (receiving resources from an upstream source) and a source (providing resources to a downstream load).


### Component, system

We adopt the definitions from [Guideline 36](./references.md#ashrae-g36) §5.1.19.1.

> A set of components is a system if they share a load in common (i.e., collectively act as a source to downstream equipment, such as a set of chillers in a lead/lag relationship serving air handlers).
> - Each air handler constitutes its own separate system because they do not share a load in common. Each AHU is a load to the CHW pump system and a source to its own VAV boxes.
> - Each VAV box constitutes its own system because they do not share a load in common. Each VAV box is a load to its AHU only (no relationship to the other AHUs) and a source to the rooms that it serves.


### Command

Command is used for the DO signal sent to switch on/off an equipment.

- Abbreviated as `y1<instance-name>`

See also [Enable](#enable).


### Enable

For VFDs, Enable is a special contact on the VFD panel typically hardwired to a relay logic for safety (see G36 Figure A-9 for instance). This is not the same as the DO point that actually starts the equipment ("on/off command" or "start signal") which is wired to VFD RUN contact.

Enable is used differently for an equipment with built-in control (e.g. chiller or boiler) where the "on/off command" is wired to the Enable contact on the control panel (see RP1711 §4), there is no RUN contact.

- Abbreviated as `y1<instance-name>`


### Status

Status is used for the DI signal returned by an equipment that can be switched on and off such as a pump, fan or chiller.

- Abbreviated as `y1<instance-name>_actual`

For 2-position actuators: ***open or closed end switch status*** is used.

- Abbreviated as `y1<instance-name>_actual` and `y0<instance-name>_actual` for open and closed end switch status, respectively


### Commanded (position | speed)

Used for the AO signal sent to an equipment.

- Abbreviated as `y<instance-name>`


### Position feedback

Position feedback is used for the AI signal returned by a modulating actuator.

- Abbreviated as `y<instance-name>_actual`

### Set point

It is defined as the desired value of the process variable which is controlled.

Spelled in ***two words*** (such as input point, output point, software point, hardware point).

::: details

This is per ASHRAE’s convention (G36 but also FUNDAMENTALS OF CONTROL) although many other sources (including Aström’s PID Controllers) use one word (setpoint).
:::

### Supply, return, entering, leaving

For the attributes pertaining to a quantity, use supply or return, and entering or leaving.

### Inlet, outlet

Restrict the use of inlet and outlet for a location, such as inlet sensor or outlet valve.
