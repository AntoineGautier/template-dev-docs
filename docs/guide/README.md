# Guide

:warning: Work in progress...

## Interface class

### What shall be declared?

###### All outside connectors needed by any derived class


::: danger Important

All outside connectors must be declared within the interface class&mdash;with the suitable conditional instance statements.

(Each class extending an interface class shall not declare any outside connector&mdash;it may only conditionally remove inherited connectors.)
:::

This ensures the [plug-compatibility](https://specification.modelica.org/maint/3.5/interface-or-type-relationships.html#plug-compatibility-or-restricted-subtyping) of any derived class, and allows
- at the template level: defining all possible connections inside a template class, whatever the redeclarations performed on its components,
- at the simulation model level: having a fixed connectivity structure for each instantiated subsystem model, which allows to connect those instances together without any concern about the actual configuration of each subsystem.

::: details

*How does it comply with the [Modelica Language Specification](https://specification.modelica.org/maint/3.5/scoping-name-lookup-and-flattening.html#generation-of-the-flat-equation-system)?*

- Type compatibility

  > Each reference is checked, whether it is a valid reference, e.g. the referenced object belongs to or is an instance, where all *existing conditional declaration expressions evaluate to true* or it is a constant in a package.

  So checking that the redeclared component is a subtype of the constraining class is done with all the conditional connectors considered present (even if the redeclared component removes them).

*How does it differ from interface classes in MBL?*

Interface classes are usually implemented with the minimum set of connectors (and other variables) and derived classes extend that set (which ensures type compatibility).
See for instance `Buildings.Fluid.Boilers.BaseClasses.PartialBoiler`:

```mo
// Buildings.Fluid.Boilers.BaseClasses.PartialBoiler
  extends Interfaces.TwoPortHeatMassExchanger(...); // Interface class used by the model

  Modelica.Blocks.Interfaces.RealInput y(...)       // Additional connector not declared in the interface class
    "Part load ratio";
  Modelica.Blocks.Interfaces.RealOutput T(...)      // Additional connector not declared in the interface class
    "Temperature of the fluid";
  Modelica.Thermal.HeatTransfer.Interfaces.HeatPort_a heatPort  // Additional connector not declared in the interface class
    "Heat port, can be used to connect to ambient";
```
:::

###### Configuration parameters and system tags

To be updated.


###### Both the [parameter record](#master-record) *and* locally accessible design parameters

The parameter record is for propagation across the instance tree.

The local design parameter declarations ensure that we have a standard set of parameters available in each template or component, whatever the configuration. For instance an evaporator coil still has `mChiWat_flow_nominal` defined with a final assignment to `0`.
Most of the local design parameters will have final assignments to the parameters from the record.

::: details Example

```mo
// Interface class Buildings.Templates.AirHandlersFans.Interfaces.PartialAirHandler

final parameter Modelica.Units.SI.MassFlowRate mAirSup_flow_nominal=
  dat.mAirSup_flow_nominal
  "Supply air mass flow rate"
  annotation (Dialog(group="Nominal condition"));
final parameter Modelica.Units.SI.MassFlowRate mAirRet_flow_nominal=
  dat.mAirRet_flow_nominal
  "Return air mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.MassFlowRate mChiWat_flow_nominal
  "Total CHW mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.MassFlowRate mHeaWat_flow_nominal
  "Total HHW mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.HeatFlowRate QChiWat_flow_nominal
  "Total CHW heat flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.HeatFlowRate QHeaWat_flow_nominal
  "Total HHW heat flow rate"
  annotation (Dialog(group="Nominal condition"));

// Derived class Buildings.Templates.AirHandlersFans.VAVMultiZone

extends Buildings.Templates.AirHandlersFans.Interfaces.PartialAirHandler(
  ...
  final mChiWat_flow_nominal=if coiCoo.have_sou then dat.coiCoo.mWat_flow_nominal else 0,
  final mHeaWat_flow_nominal=(if coiHeaPre.have_sou then dat.coiHeaPre.mWat_flow_nominal else 0) +
    (if coiHeaReh.have_sou then dat.coiHeaReh.mWat_flow_nominal else 0),
  final QChiWat_flow_nominal=if coiCoo.have_sou then dat.coiCoo.Q_flow_nominal else 0,
  final QHeaWat_flow_nominal=(if coiHeaPre.have_sou then dat.coiHeaPre.Q_flow_nominal else 0) +
    (if coiHeaReh.have_sou then dat.coiHeaReh.Q_flow_nominal else 0));
```
:::

## Replaceable component

No `choicesAllMatching` annotation is currently allowed in the `Templates` package (to maximize support across various Modelica tools).
Expand into an explicit `choices` annotation with proper description strings and the following rules.
- Use `redeclare replaceable` to allow
  - further redeclaration by the user,
  - visiting the parameter dialog box of the redeclared component (this is Dymola's behavior, although if the redeclared component contains replaceable components that behavior is enabled automatically).


## Section

A so-called section is needed anytime there is a hard constraint on the allowable choices for two replaceable components that are at the same level of composition.

::: details Example

In the case of a multiple-zone VAV with an air economizer, a return fan should require a modulating relief damper. However, we cannot bind the redeclaration of the damper component to the redeclaration of the return fan component. So we introduce a section `Templates.AirHandlersFans.Components.ReliefReturnSection` that contains the two components, so that the whole section component can be redeclared with the proper inside fan and damper components.
:::

The interface class for a section should use the same class for the control bus as the one used by the system template.
This differs from the basic components which have a dedicated class for the control bus `Buildings.Templates.Components.Interfaces.Bus`.
The motivation is to avoid nesting expandable connectors and to enable traversing seamlessly the composition levels when connecting signal variables.

```mo
// Buildings.Templates.AirHandlersFans.VAVMultiZone
connect(secOutRel.bus, bus);            // secOutRel is a section
connect(ctl.bus, bus);                  // ctl is a controller

// Buildings.Templates.AirHandlersFans.Components.OutdoorReliefReturnSection
connect(damRet.bus, bus.damRet);        // connection to the damper bus inside the section

// Buildings.Templates.AirHandlersFans.Components.Controls.G36VAVMultiZone
connect(ctl.yRetDamPos, bus.damRet.y);  // accessing the damper control variable inside the controller
```


## Control section

We instantiate all control blocks that form the control sequence of a system into one single class that is similar to a [section](#section), see for instance [`Buildings.Templates.AirHandlersFans.Components.Controls.G36VAVMultiZone`](https://github.com/lbl-srg/modelica-buildings/blob/8b0d03018b18928fc9a08367e4d330e3eb711941/Buildings/Templates/AirHandlersFans/Components/Controls/G36VAVMultiZone.mo).

Particularly this control section uses the same class for the control bus as the one used by the system template.


## Control point connections

To be updated.

## Master record

The master record of a template class is the Modelica data structure that is used to

- assign design and operating parameter values for all subcomponents,
- support parameter propagation from a top-level, whole HVAC system parameter record,
- populate the [equipment schedule in Linkage UI](https://docs.google.com/document/d/16Z8HqTi3vNV3HUaa4ijBPVSQvA4MyGTu8bxoGTBD2YI/edit?usp=sharing).


### Implementation rules

###### Use only one nesting level

If needed, component records must extend (not instantiate) subcomponent records.
For instance in `Buildings.Templates.Components.Coils.Interfaces.Data`:

- The class cannot extend `Buildings.Templates.Components.Valves.Interfaces.Data` because of the colliding  declarations of `typ`.
- So `dpValve_nominal` is declared locally and a protected record with the type `Buildings.Templates.Components.Valves.Interfaces.Data` is constructed to pass in parameters to the valve component.

###### Configuration parameters must be set through the component model, not through the record

- Structural parameters are assigned ***from*** the component model ***to*** the record, and propagated ***up*** the instance tree.
- Design and operating parameters are assigned ***from*** the record ***to*** the component model, and propagated ***down*** the instance tree.

The record for the [controller section](#control-section) needs to be instantiated (not extended) in the master record because it requires many structural parameters (such as `typFanSup`) that have duplicates in the master record.


At the component level, we instantiate the component record and bind (`final`) local parameters to the record elements, as in `Buildings.Fluid.Chillers.ElectricEIR` (as opposed to extending the record to integrate the parameter definitions as `Buildings.Fluid.Actuators.BaseClasses.ValveParameters`).
This allows simpler propagation (only the record is passed in) which is agnostic from the parameter structure of the constraining class (for instance `mWat_flow_nominal` is not defined in `Buildings.Templates.Components.Coils.Interfaces.PartialCoil`).


###### Do not use final bindings for configuration parameters

Use `annotation(Dialog(enable=false))` instead.

This is a temporary workaround for what seems to be a bug in Dymola (SRF00860858) and to allow propagating from a top-level (whole building) record as in `Buildings.Templates.AirHandlersFans.Validation.VAVMZNoEconomizer`.


::: details About outer references

Top-level model with outer references should be supported but the valid `outer replaceable` component declaration clause differs between OCT and Dymola, see [`issue1374_templates_record_outer`](https://github.com/AntoineGautier/modelica-buildings/blob/issue1374_templates_record_outer/Buildings/Templates/AirHandlersFans/Validation/UserProject/DataTopLevelDymola.mo).

At the AHU template level, switching to outer references (and using a model instead of a record&mdash;as [elements of a record shall not have `inner` nor `outer` prefixes](https://specification.modelica.org/maint/3.5/class-predefined-types-and-declarations.html#specialized-classes)) would avoid painful propagation of configuration parameters `typ*`. However, this will not support propagation from a top level (whole building) record then.
:::


### Exposed parameters

To be updated.



## Icons for system schematics

Refer to the [specification for the generation of engineering schematics](https://lbl-srg.github.io/linkage.js/requirements.html#engineering-schematic) if needed.

::: warning Modelica tool support

Currently the SVG graphics integrated using class annotations such as `Icon(graphics={Bitmap(fileName=<svg-file-path>, visible=<boolean-expression>))` are not rendered by Modelon Impact, and only very incompletely by OMEdit, most likely due to `<boolean-expression>` not being evaluated at UI runtime.

Dymola (v2022.x) entirely supports those features.
:::

The master SVG document containing all raw icons provided by Taylor Engineering and used in [Guideline 36](../references.md#g36) is currently located at [`Buildings/Resources/Images/Templates/Icons.svg`](https://github.com/lbl-srg/modelica-buildings/blob/issue1374_templates/Buildings/Resources/Images/Templates/Icons.svg).

Those raw icons must be processed as described below for Inkscape (v1.1) before being used in the icon layers of Modelica classes.

- Select object, copy to new file
- Change line color to black
- Account for 100 px for each grid cell in Dymola icon layer
- For most of the AHU components, lock width/height ratio and change height to 1000 px (lower resolution is blurry in Dymola). For transducers, 1000 px is for the probe, 400 px for the box
- Change stroke width to 10 px and reset height to 1000 px
- For polygons, the different segments will typically not be connected together (gap at each corner), so select each segment with `Node` tool and use `Node` functionalities to
  - `Convert selected objects to path`
  - `Join selected nodes`
  - For the last corner use `Path/Union`
- Text should be in sans-serif with font size of 150 (if needed, select text object and transform to path with `Path/Object to Path`)
- Select object and `Edit/Resize Page to Selection`
- Save copy as plain SVG




## Code base

### Git workflow

The main feature branch for template development is [`issue1374_templates`](https://github.com/lbl-srg/modelica-buildings/tree/issue1374_templates) that currently depends on&mdash;and is periodically kept in sync with

- MBL `master`
- MBL [`issue1913_g36_final`](https://github.com/lbl-srg/modelica-buildings/tree/issue1913_g36_final)

Each new development should
- start by branching out from the main feature branch&mdash;so the new branch is a dependent of the main feature branch,
- be kept in sync with MBL master ***by merging the main feature branch***, as opposed to merging MBL master directly.


### Code tags

Use the code tags from [PEP 350](https://peps.python.org/pep-0350/#mnemonics) to reference issues and feature enhancements directly in the Modelica code base. Specify the GH issue number if available.
We keep it simple and only use:

- `BUG` for what prevents from translating or simulating a model: ***should prevent merging***
- `FIXME` for any technical debt not suitable for production: ***should prevent merging***, include [PEP 350](https://peps.python.org/pep-0350/#mnemonics) `TODO` under that code tag
- `HACK` mainly for workarounds related to Modelica tools' limitations: reference the ticket number from the Modelica tool provider if available
- `RFE` for a clearly identified development need (as opposed to an idea)

So we can collect all code tags with:

```sh
grep -nER '(^|/(\*|/)|<!--|")\s*(BUG|FIXME|HACK|RFE)' Buildings/Templates/.
```

That returns for instance:

```sh
Buildings/Templates/./Components/Types.mo:102:  // RFE: Add support for PICV.
Buildings/Templates/./Components/Pumps/package.mo:4:  // FIXME: Package and models are still under development.
Buildings/Templates/./ZoneEquipment/Components/Data/VAVBoxController.mo:44:  // FIXME #1913: not in §3.1.2.2 VAV Reheat Terminal Unit
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:29:  FIXME: have_hotWatCoi should not have been deleted, see https://github.com/lbl-srg/modelica-buildings/commit/5d1c7d9bbe17c0049a1fc332005705f35e1593dc#r67866444
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:106:  // FIXME #1913: not in §3.1.1.2 Outdoor Air Ventilation Set Points
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:110:  // FIXME #1913: not in §3.1.2.2 VAV Reheat Terminal Unit.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:116:  // FIXME #1913: should be inputs such as in Buildings.Controls.OBC.ASHRAE.G36.ThermalZones.Setpoints
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:141:  // BUG #1913: missing default parameter assignment, see non final bindings below.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:178:  // FIXME #1913: occDen should not be exposed.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:204:    "FIXME #1913: Optimal start using global outdoor air temperature not associated with any AHU"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:207:    "FIXME #1913: Should be conditional, depending on have_hotWatCoi"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:210:    "FIXME #1913: Validate override logic: should not be used in simulation"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:213:    "FIXME #1913: Validate override logic: should not be used in simulation"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:216:    "FIXME #1913: Should be conditional, depending on have_hotWatCoi"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:219:    "RFE: Set point adjustment by the occupant is not implemented"
Buildings/Templates/./AirHandlersFans/VAVMultiZone.mo:4:  HACK: In Dymola only (ticket SR00860858-01), bindings for the parameter record
Buildings/Templates/./AirHandlersFans/VAVMultiZone.mo:53:  RFE: Currently only the configuration with economizer is supported.
Buildings/Templates/./AirHandlersFans/VAVMultiZone.mo:563:<!-- RFE: This should be integrated in the AHU template ultimately. -->
```