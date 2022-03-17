# Guide

:warning: Work in progress...

Variables accessible at top-level of each template class

- Design parameters
- All possible connectors
- Parameter record



## Replaceable components

No `choicesAllMatching` annotation is currently allowed in the `Templates` package (to maximize support across various Modelica tools).
Expand into an explicit `choices` annotation with proper description strings and the following rules.
- Use `redeclare replaceable` to allow
  - further redeclaration by the user,
  - visiting the parameter dialog box of the redeclared component (this is Dymola's behavior, although if the redeclared component contains replaceable components that behavior is enabled automatically).



## Section

Sections are needed anytime there is a compatibility constraint on the possible choices for two replaceable components that are at the same level of composition.

::: details Example

For instance, in the case of a multiple-zone VAV with air economizer, a return fan requires a modulating relief damper. However, we cannot bind the redeclaration of the damper component to the redeclaration of the return fan component. So we introduce a section `Templates.AirHandlersFans.Components.ReliefReturnSection` containing the two components, so that the whole section component be redeclared with the proper inside fan and damper components.
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

We instantiate all control blocks that form the control sequence of a system into one single class that is similar to a [section](#section).
Particularly this control section uses the same class for the control bus as the one used by the system template.



## Control point connections



## Master record

- Which parameters should be exposed

```mo
final parameter Modelica.Units.SI.MassFlowRate mAirSup_flow_nominal=
  dat.mAirSup_flow_nominal
  "Supply air mass flow rate"
  annotation (Dialog(group="Nominal condition"));
final parameter Modelica.Units.SI.MassFlowRate mAirRet_flow_nominal=
  dat.mAirRet_flow_nominal
  "Return air mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.MassFlowRate mChiWat_flow_nominal=
  "Total CHW mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.MassFlowRate mHeaWat_flow_nominal=
  "Total HHW mass flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.HeatFlowRate QChiWat_flow_nominal=
  "Total CHW heat flow rate"
  annotation (Dialog(group="Nominal condition"));
parameter Modelica.Units.SI.HeatFlowRate QHeaWat_flow_nominal=
  "Total HHW heat flow rate"
  annotation (Dialog(group="Nominal condition"));
```



## Icons for system schematics

The master SVG documents containing the raw icons provided by Taylor Engineering is currently located at ``.


## Code base

### Git workflow

The main development branch is [`issue1374_templates`](https://github.com/lbl-srg/modelica-buildings/tree/issue1374_templates) that currently depends on&mdash;and is periodically kept in sync with
- MBL master
- MBL [`issue1913_g36_final`](https://github.com/lbl-srg/modelica-buildings/tree/issue1913_g36_final)

Each new development should
- start by branching out from the main development branch,
- pull updates from MBL master ***via merging the main development branch***, not from merging MBL master directly.


### Code tags

Use the code tags from [PEP 350](https://peps.python.org/pep-0350/#mnemonics) to reference issues and feature enhancements directly in the Modelica code base. Specify the GH issue number if available.
We keep it simple and only use:

- `BUG` when this prevents from translating or simulating the model (should prevent merging)
- `FIXME` for any technical debt not suitable for production (should prevent merging, include [PEP 350](https://peps.python.org/pep-0350/#mnemonics) `TODO` under that code tag)
- `HACK`
- `RFE`
- `TODOC`

So we can collect all code tags with:

```sh
grep -nER '(^|/(\*|/)|<!--|")\s*(BUG|FIXME|HACK|RFE|TODOC)' Buildings/Templates/.
```

That returns for instance:

```sh
Buildings/Templates/./ZoneEquipment/Components/Data/VAVBoxController.mo:44:  // FIXME #1913: not in §3.1.2.2 VAV Reheat Terminal Unit
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:29:  FIXME: have_hotWatCoi should not have been deleted, see https://github.com/lbl-srg/modelica-buildings/commit/5d1c7d9bbe17c0049a1fc332005705f35e1593dc#r67866444
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:106:  // FIXME #1913: not in §3.1.1.2 Outdoor Air Ventilation Set Points
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:110:  // FIXME #1913: not in §3.1.2.2 VAV Reheat Terminal Unit.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:116:  // FIXME #1913: should be inputs such as in Buildings.Controls.OBC.ASHRAE.G36.ThermalZones.Setpoints
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:141:  // HACK: missing default parameter assignment, see non final binding below.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:178:  // FIXME #1913: occDen should not be exposed.
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:204:    "FIXME #1913: Optimal start using global outdoor air temperature not associated with any AHU"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:207:    "FIXME #1913: Should be conditional, depending on have_hotWatCoi"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:210:    "FIXME #1913: Validate override logic: should not be used in simulation"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:216:    "FIXME #1913: Should be conditional, depending on have_hotWatCoi"
Buildings/Templates/./ZoneEquipment/Components/Controls/G36VAVBoxReheat.mo:219:    "RFE: Set point adjustment by the occupant is not implemented"
Buildings/Templates/./AirHandlersFans/VAVMultiZone.mo:478:<!-- RFE: This should be integrated in the AHU template ultimately. -->
Buildings/Templates/./AirHandlersFans/Components/Controls/Interfaces/PartialVAVMultizone.mo:26:  // RFE #1913: implement computation based on speed if Calculated.
```