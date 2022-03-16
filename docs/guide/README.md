# Guide

:warning: Work in progress...

Variables accessible at top-level of each template class

- Design parameters
- All possible connectors
- Parameter record

Icons

Control point connections

Master record

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


## Code base

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
$ grep -nER '(^|/(\*|/)|<!--|")\s*(BUG|FIXME|HACK|RFE|TODOC)' Buildings/Templates/.
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
...
```