# Guide

Variables accessible at top-level of each template class

- Design parameters
- All possible connectors
- Parameter record

Icons

Control point connections

Master record

- Which parameters should be exposed?




## Master record

- [x] dpFixed_nominal for dampers and valves depending on coil.

- [x] Reintroduce id parameter

- [ ] For evaporator coils this is provided by the performance data record: just check with assert statement that this is consistent?

Issues with dedicated sub record for configuration parameters

- Not easily compatible with only one level of composition: for instance `extends Buildings.Templates.AirHandlersFans.Components.OutdoorReliefReturnSection.Interfaces.Data` brings structural parameters that would need to be bound to duplicated parameters in cfg record.
- Creates a circularity when propagating down the record, need to package all non-structural parameters into a subrecord (thus violating the one-level of nesting rule) and propagate only that subrecord.

Test dans Buildings.Templates.AirHandlersFans.VAVMultiZone

  extends Buildings.Templates.AirHandlersFans.Interfaces.AirHandler(
    nZon(final min=2),
    redeclare Buildings.Templates.AirHandlersFans.Data.VAVMultiZone datRec(
      coiHeaPre(typ=coiHeaPre.typ,...

Structural and configuration parameters must be set through the component model, not through the record.

- Structural parameters are assigned FROM the component model TO the record, and propagated UP the instance tree.
- Design and operating parameters are assigned FROM the record TO the component model, and propagated DOWN the instance tree.

Default for all parameters in the record definition except for structural and configuration parameters!

- Coil capacity, air flow rate, etc.
- Linkage: use start as default in the schedule?

Record for controller needs to be instantiated (not extended) in the master record because it requires many structural parameters (such as typFanSup) that are duplicated from the master record.

Rule: only one level of nesting => if needed, component records must extend (not instantiate) subcomponent records.
In `Buildings.Templates.Components.Coils.Interfaces.Data`

- Cannot extend `Buildings.Templates.Components.Valves.Interfaces.Data` because of the duplicated inconsistent declaration of `typ`.
- So we declare dpValve_nominal locally and construct a protected `Buildings.Templates.Components.Valves.Interfaces.Data` record to pass in parameters to the valve instance.


At the component level, we instantiate the component record and bind (final) local parameters to the record elements, as in `Buildings.Fluid.Chillers.ElectricEIR` (as opposed to extending the record to integrate the parameter definitions as `Buildings.Fluid.Actuators.BaseClasses.ValveParameters`).
This allows simpler propagation (only the record is passed in), agnostic from the parameter structure of the constraining class (for instance `mWat_flow_nominal` is not defined in `Buildings.Templates.Components.Coils.Interfaces.PartialCoil`).

Top-level model with outer references should be supported but the valid `outer replaceable` component declaration clause differs between OCT and Dymola, see `issue1374_templates_record_outer`.

At the AHU template level, switching to outer references (using a model instead of a record where it is prohibited) would avoid painful propagation of configuration parameters `typ*`. HOWEVER, this will not support propagation from a top level (whole building) record then!

Dialog annotations:

- At the component level, use standard configuration, nominal condition, etc.
- At the system template level, use group="Schedule.Mechanical" or group="Schedule.Control parameters" so that it can be used to populate the equipment schedule in the UI (see https://docs.google.com/spreadsheets/d/1kko4qZswFHUqOeexBIz8Ix_ngJB_9dcjwFRQxO_G56c/edit?usp=sharing). Do not use final bindings for configuration parameters to allow propagation from top-level (whole building) record. Instead, use "enable=false".



### Equipment schedule specification

How do we deal we arrays?

What to do for default bindings with non-literal parameters?

Specify What to do with min/max for
```
Q_flow_nominal(final max=0)=if typCoiCoo==Buildings.Templates.Components.Types.Coil.None then 0 else
      -1 * dat.getReal(varName=id + ".mechanical.coilCooling.Capacity.value")
```

Disregard record types


## TODO

P/Ti parameters to propagate at controller level?

- 1/27/22: Not now (PNNL working on autotuning + accessible with Show component)

Test duplicate declaration in derived class (section) with different choices annotation.

Develop partial controller for air-cooled and extend for water-cooled plant.
Remove if isAirCoo such as in

  parameter Modelica.Units.SI.TemperatureDifference dTLif_min(displayUnit="K")=
    if isAirCoo then 0 else

Refactor the templates that use annotations such as annotation(Dialog(enable=fanSupBlo.typ==Buildings.Templates.Components.Types.Fan.None)) (not interpreted by Dymola)

- with a vendor specific annotation, or
- with a new component that eliminates the need for such an annotation.

Look into the unit management system in Impact (see configuration file) to further specify how Linkage should deal with user specific units (as opposed to variable specific units with displayUnit).

## AHU

Use Q_flow_nominal in Modelica (<0 or >0) and another name (capacity) in JSON (with min: 0)

Nota: inner/outer for parameters allows implicit propagation, very useful if the redeclared component uses parameters not declared in the constraining class

Use _min _max _nominal

Question: should we use Modelica.Units.SI.* for parameters of the control blocks or stick to Real as OBC control blocks?

VAirSup_flow: different options (right now only through fanSup.V_flow)

## VAV controller update issue1913_g36_final (d3c5e67)

Compilation fails for `Buildings.Controls.OBC.ASHRAE.G36.TerminalUnits.Reheat.Subsequences.Validation.SystemRequests`.

In `Buildings.Controls.OBC.ASHRAE.G36.ZoneGroups.ZoneStatus` zone temperature set points are parameters (such as `THeaSetOcc`).
In `Buildings.Controls.OBC.ASHRAE.G36.ThermalZones.Setpoints` they are inputs which seems more aligned with typical simulation requirements.

- Should we refactor the first block for consistency?
- This is related to the CDL specification regarding the way software points are implemented: parameters or input variables?
  > 5.1.10 All set points, timers, deadbands, PID gains, etc. listed in sequences shall be adjustable by the user with appropriate access level whether indicated as adjustable in sequences or not. ***Software points*** shall be used for these variables. Fixed scalar numbers shall not be embedded in programs except for physical constants and conversion factors.


In `Buildings.Controls.OBC.ASHRAE.G36.AHUs.MultiZone.VAV.SetPoints.OutdoorAirFlow.Zone`

```
  parameter Real occDen(final unit = "1/m2") = 0.05
    "Default number of person in unit area";
  parameter Real desZonPop(
    final min=occDen*AFlo,
    final unit = "1")
    "Design zone population during peak occupancy"
```

- Why not require only one of those 2 parameters, as in `Buildings.Controls.OBC.ASHRAE.G36.AHUs.MultiZone.VAV.Controller` where only `desZonPop` is used.
- Also having both ""***Default*** number of person" and "***Design*** zone population" is confusing. ASHRAE 62.1 states:
  > 6.2.1.1.7 Design Zone Population. Design zone population (P z ) shall equal the largest (peak) number of people expected to occupy the ventilation zone during typical use. (...) Where the largest or average number of people expected to occupy the ventilation zone cannot be established for a specific design, an estimated value for zone population shall be permitted, provided such value is the product of the net occupiable area of the ventilation zone and the default occupant density listed in Table 6-1.

  So the designer's choice already happened: either he has a value for peak occupancy specified for the project, or he adopts to 62.1 default as the design value. We should have only one entry at this level which is the design value (whatever the way the designer evaluated it)--per area or absolute.
- "During peak occupancy" is redundant with "Design".

```
  parameter Real floHys(
    final unit="m3/s",
    final quantity="VolumeFlowRate")
    "Near zero flow rate, below which the flow rate or difference will be seen as zero"
    annotation (Dialog(tab="Advanced"));
  parameter Real damPosHys(
    final unit="1")
    "Near zero damper position, below which the damper will be seen as closed"
    annotation (Dialog(tab="Advanced"));
  parameter Real valPosHys(
    final unit="1")
    "Near zero valve position, below which the valve will be seen as closed"
```

- Missing defaults (those parameters impact the evaluation of structural parameters).


5.2.2 Time-Averaged Ventilation does not seem to be implemented. Hence, there is not parameter for the VAV Box Controllable Minimum air flow rate.

```
  parameter Real outAirRat_area=0.0003
    "Outdoor airflow rate per unit area, m3/s/m2"
    annotation (Dialog(group="Design conditions"));
  parameter Real outAirRat_occupant=0.0025
    "Outdoor airflow rate per occupant, m3/s/p"
```

- Inconsistent naming with `Buildings.Controls.OBC.ASHRAE.G36.AHUs.MultiZone.VAV.SetPoints.OutdoorAirFlow.Zone`: `VOutPerAre_flow` and `VOutPerPre_flow`

```
  parameter Real staPreMul
    "Importance multiplier for the zone static pressure reset control loop"
    annotation (Dialog(tab="Alarms"));
  parameter Real hotWatRes
    "Importance multiplier for the hot water reset control loop"
    annotation (Dialog(tab="Alarms"));
```

- A default of 1 should be provided.


```
  Buildings.Controls.OBC.CDL.Interfaces.RealInput setAdj
    if have_locAdj and not sepAdj
    "The adjustment value for both heating and cooling setpoints if it allows only single setpoint adjustment"
    annotation (Placement(transformation(extent={{-460,330},{-420,370}}),
        iconTransformation(extent={{-140,-20},{-100,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput cooSetAdj
    if have_locAdj and sepAdj
    "Cooling setpoint adjustment value"
    annotation (Placement(transformation(extent={{-460,290},{-420,330}}),
        iconTransformation(extent={{-140,-40},{-100,0}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput heaSetAdj
    if have_locAdj and sepAdj
    "Heating setpoint adjustment value"
```

- Missing unit and quantity attribute, especially it would be useful to specify ***adjustment offset*** to make it clear that a deltaT is expected.

```
  parameter Real V_flow_nominal(
    final unit="m3/s",
    final quantity="VolumeFlowRate",
    final min=1E-10)
    "Nominal volume flow rate, used to normalize control error"
```

- Remove declaration, use `max(VHeaZonMax_flow, VCooZonMax_flow)`


```
  parameter CDL.Types.SimpleController controllerTypeVal
    "Type of controller"
```

- Missing default

```
  Buildings.Controls.OBC.CDL.Interfaces.BooleanInput uHotPla
    "Hot water plant status"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput uVal(
    final min=0,
    final max=1,
    final unit="1")
    "Actual hot water valve position"
```

- Should be conditional, depending on `have_hotWatCoi`


```
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yDamSet(
    final min=0,
    final unit="1")
    "Damper position setpoint after considering override"
```

- Fix description string: depending on `have_pressureIndependentDamper` this is either the commanded position or the flow rate set point (ratio to nominal).



## CHW plant template

In `Buildings.Templates.ChilledWaterPlant.Interfaces.PartialChilledWaterPlant`

```
protected
  parameter Boolean isAirCoo=
    typ == Buildings.Templates.Types.ChilledWaterPlant.AirCooledParallel or
    typ == Buildings.Templates.Types.ChilledWaterPlant.AirCooledSeries
    "= true, chillers in group are air cooled,
    = false, chillers in group are water cooled";
```

But in `Buildings.Templates.ChilledWaterPlant.BaseClasses.AirCooled`

```
model AirCooled
  extends PartialChilledWaterLoop(final isAirCoo=true);
end AirCooled;
```

In `Buildings.Controls.OBC.ASHRAE.PrimarySystem.ChillerPlant.Controller`

```
  parameter Integer nPum_nominal(
    final max=nPumPri,
    final min=1)=nPumPri
    "Total number of pumps that operate at design conditions"
    annotation (Dialog(tab="Chilled water pumps", group="Nominal conditions"));
```

Meaning that the number of pumps (installed, with redundancies, available for rotation) can exceed the max number of operating pumps: do we want to model that?

The models within `Buildings.Fluid.HeatExchangers.CoolingTowers` have no built-in control to switch individual cells of the tower on or off. To switch cells on or off (as a realistic control sequence would do), multiple instances of those models should be used. So we would have a 2-dimension array `cooTow[nCooTow, nCel]`.

- However, my understanding is that the guideline makes no difference between the number of cells and the number of cooling towers. So a clarification in the description string such as "Count one tower for each cell" should be enough.

Design parameters from `Buildings.Templates.ChilledWaterPlant.Components.CoolingTowerGroup.CoolingTowerParallel` must be declared in the interface class so that other components can access them. For instance the G36 controller needs the design cooling tower wetbulb temperature and the approach (which should be computed).

The same holds for WSE.

In `systems.json` the following parameters do not seem to be used.

```
            "dTApp": {
                "value": 3,
                "description": "Approach temperature",
                "unit": "K"
            },
            "TMin": {
                "value": 288.15,
                "description": "Minimum tower outlet temperature",
                "unit": "K"
            }
```

```
  parameter Modelica.Units.SI.MassFlowRate m1_flow_nominal(min=0)
    "Nominal mass flow rate"
    annotation(Dialog(group = "Nominal condition", enable=not isAirCoo));
  parameter Modelica.Units.SI.MassFlowRate m2_flow_nominal(min=0)
    "Nominal mass flow rate"
    annotation(Dialog(group = "Nominal condition"));

  replaceable parameter Buildings.Fluid.Chillers.Data.BaseClasses.Chiller
    per constrainedby Buildings.Fluid.Chillers.Data.BaseClasses.Chiller(
      QEva_flow_nominal=Q_flow_nominal,
      TEvaLvg_nominal=TCHWSupSet_nominal,
      mEva_flow_nominal=m2_flow_nominal,
      mCon_flow_nominal=m1_flow_nominal)
    "Chiller performance data"
    annotation (Placement(transformation(extent={{70,-8},{90,12}})));
```

But `m2_flow_nominal` is not the nominal flow rate of `ports_a2` which seems counter intuitive.
I would rather introduce a more explicit parameter naming such as `mCHWChi_flow_nominal` for CHW flow rate of each chiller and `mCHW_flow_nominal` or `mCHWPri_flow_nominal` for the total flow rate.

In `Buildings.Templates.ChilledWaterPlant.Components.PrimaryPumpGroup.Headered`

```
connect(pum.y_actual, busCon.uStaPumPri)

```

- Use `y` notation for (measurable) outputs.
- Should be `yPumCHWPri_actual` according to https://docs.google.com/document/d/16xKPf6AW_nsLAs-0NqPd1t1CcoFD7HAO/edit and https://docs.google.com/document/d/1LeutsY9__ClaIEjmvRHkIAMGX5dlW0Xo1BFGvJTHjs4/edit
- That signal is also used for the CW pumps where "primary" is incorrect then.


In `Buildings.Templates.ChilledWaterPlant.BaseClasses.PartialChilledWaterLoop`

```
connect(evaSta.y, busCon.sta)
```

- Rename as `y_actual`.

In `Buildings.Templates.ChilledWaterPlant.Components.ReturnSection.WatersideEconomizer`

```
  // If supply pump
  Buildings.Templates.Components.Sensors.Temperature TWSESup(
    redeclare final package Medium = MediumCHW,
    final m_flow_nominal=m2_flow_nominal,
    final typ=Buildings.Templates.Components.Types.SensorTemperature.InWell,
    final have_sen=true) if not have_val
    "Waterside economizer entering temperature"
```

- This sensor is needed whatever the device used to modulate the WSE CHW flow rate.
- > Enable waterside economizer (WSE) if it has been disabled for at least 20 minutes and CHWRT upstream of HX is greater than the predicted heat exchanger leaving water temperature

Within `Buildings.Templates.ChilledWaterPlant.Components.Chiller.ElectricChiller`

```
connect(busCon.TSet, chi.TSet)
```

yields a variable `busCHW.chi.TSet` with a dimensionality of 1.

- Refactor with the same set point for all chillers.
- Implies that `chi` cannot have a dimensionality of 1.
- Same holds for parallel pumps controlled at the same speed.



## With Baptiste

systems.json modified with top-level system type: use tag instead of id (final, computed internally)

CHW plant sequence from Jianjun: https://github.com/lbl-srg/modelica-buildings/pull/2299


## With Paul

- [ ] Isolation damper: generic case, what if HR?
- [ ] DPS / DPT: safety or switch, NOT sensor
- [ ] DPT / supply air flow
- [ ] Fan Enable & Run
- [ ] T sensors averaging / standard probe
- [ ] Electrical diagram for AHU
- [ ] Template overview
- [ ] Equipment schedule: valve pressure drop
- [ ] HR and economizer

## TODO

What is the plan to represent the following?

Head pressure control output required only for chillers that require head pressure control. This is
an output from the chiller controller head pressure control loop.

Required for primary-only CHW plants: CH Demand Limit

CH refrigerant evaporator temperature

CH refrigerant condenser temperature

Chiller local/auto switch


Validate the status computation (state VS time event) for all equipment with Michael.


## Icon Integration

> If you check out the branch issue1374_templatesof MBL and look at the class Templates.AirHandlersFans.Components.OutdoorReliefReturnSection.Interfaces.PartialOutdoorReliefReturnSection you will notice that the icon layer can be quite cumbersome to implement by the template developer. The advantage is that it gives a graphical feedback of the actual system configuration with any Modelica graphical editor, without depending on Linkage, see for instance the diagram view of Templates.AirHandlersFans.Validation.UserProject.AHUs.ControlsGuideline36. The drawback is that it duplicates a lot of Boolean expressions that are used in the subcomponents, which is likely difficult to maintain. An alternative would be to have Linkage build the icon of classes such as Buildings.Templates.AirHandlersFans.Components.ReliefReturnSection.ReturnFan as an SVG file, based on its diagram layer. This should be recursive up to the top-level template class Buildings.Templates.AirHandlersFans.VAVMultiZone, where the SVG file would be the actual system schematic to be exported.


## TODO

Bus for simulation output variables

Pressure parametrization

- Filters DP used only for alarming, include in schematic, do not model?

Test class parameterization with records

parameter RecordCoil dat = if coiCoo.typ == CoiCooling then RecordCoolingCoil else...

Our strategy / ExternData

- `annotation(__Dymola_translate=true)` included in last version of the library (https://github.com/modelica-3rdparty/ExternData/blob/master/ExternData/package.mo#L1162) but only for functions returning array sizes.
- we need it potentially for all functions: impact on translation time to be evaluated.

json parameter file with Modelica variable name and description field instead

TODO:

- parameter records / json: replaceable record avec au moins les paramètres de design at efficacite par défaut, generic ou meilleur defaut, à l'utilisateur de remplacer dans un Modelica tool

Plan meeting:

- w/ Modelon: du 12 au 23/12

- Replaceable class w/ varying choices annotation in derived class (`Choices` annotations in extend clauses (although legal) are not interpreted by Dymola)
- Parameter assignment with external file: dependency to generate that file, possible "Modelica" native workflow?
  - Evaluation of structural parameters and nominal attributes at translation: where is it specified? Tool specific?
    - See discussion at https://github.com/modelica/ModelicaSpecification/issues/2373
  - Error with OCT `Constructors for external objects is not supported in functions` but https://specification.modelica.org/maint/3.5/functions.html#external-objects states
  > [External objects may be a protected component (or part of one) in a function. The constructor is in that case called at the start of the function call, and the destructor when the function returns, or when recovering from errors in the function.]
- parameter records / json, arrays of different records?
- Warnings with OCT: outer parameter `id` is unassigned
- expression evaluation/parsing see https://drive.google.com/file/d/1MIZZn93fg6QSprisSEd_BHmfMIFjFNWq/view?usp=sharing
- generation of parameter file/schema from external function calls
- start investigating translation time
- Vendor annotations, expression evaluation


ChoicesAllMatching=true à remplacer.

- [x] Replaceable sections within `PartialOutdoorReliefReturnSection`
  - Does not work because `Choices` annotations in extend clauses (although legal) are not interpreted by Dymola. This prevents instantiating partial replaceable components at the top level, for instance in PartialOutdoorReliefReturnSection
  - Same limitation leads to Buildings.Templates.Components.Coils.WaterBasedHeating and Buildings.Templates.Components.Coils.WaterBasedCooling

    ```
      extends Buildings.Templates.AirHandlersFans.Components.OutdoorReliefReturnSection.Interfaces.PartialOutdoorReliefReturnSection(
        redeclare replaceable Buildings.Templates.AirHandlersFans.Components.ReliefReturnSection.ReturnFan secRel
          constrainedby Buildings.Templates.AirHandlersFans.Components.ReliefReturnSection.Interfaces.PartialReliefReturnSection
          annotation (
            choices(
              choice(redeclare Buildings.Templates.AirHandlersFans.Components.ReliefReturnSection.ReturnFan secRel
                "Return fan - Modulated relief damper"),
              choice(redeclare Buildings.Templates.AirHandlersFans.Components.ReliefReturnSection.ReliefFan secRel
                "Relief fan - Two-position relief damper"))),
    ```


## Tell Devetry

Modelica import is required, that should be the data format to save the current state of configuration.
The user may need to reload a Modelica file that was modified in a third party tool (parameter value changed).

- But how do we check that the modified Modelica complies with Linkage requirements and is valid to be consumed?

## Iterations with Baptiste

:warning: Dymola manages graphical feedback if type assignment does not require class name lookup. USE full class name!


### Notes

Capacity of cooling coil > 0

Nomenclature

 - con ambiguous for configuration or controller, typ for configuration ~~

Check if unit and displayUnit are propagated with no predeclaration in bus

- Yes! See `Buildings.Templates.TerminalUnits.Validation.ControlsGuideline36`


### 10/13/21

- system, subsystem, component, piece of equipment
- name for sensor components: full variable? yields `TMix.T`, `VSup_flow.V_flow` or
  - `TMix.y`, `VSup_flow.y` and use replaceable class for main sensor
  - What about explicit sensor with no need for configuration parameter e.g. VDis_flow in Buildings.Templates.BaseClasses.Dampers.PressureIndependent
    - Keep as is as long as icon for schematics is consistent.
- share google doc https://docs.google.com/document/d/16xKPf6AW_nsLAs-0NqPd1t1CcoFD7HAO/edit?usp=sharing&ouid=100056680517301634140&rtpof=true&sd=true


Need for a record to centralize parameters?

- not now

Use of `getInstanceName` to specify `funStr` used to

- [x] Abandon completely and use a type assignment


Template package for subsystems: urgent? No, after dev AHU and CHW plant.


## TODO

Make FIXME control points in G36 controller conditional to the configuration, see yDamRel Boolean or Real

Binding expressions of inner/outer parameters

In component ahu.secOutRel:
  The parameter ahu.secOutRel.id does not have a binding expression
Warning at line 20, column 3, in file '/home/agautier/gitrepo/modelica-buildings/Buildings/Templates/AirHandlersFans/Components/OutdoorSection/Interfaces/PartialOutdoorSection.mo',



## 10/6 Notes on paper

*A Templated Approach for Multi-Physics Modeling of Hybrid Energy Systems in Modelica.*

What is simpler than Linkage: there is only a maximum of one instance of each subsystem, as opposed to arrays in our case.

> Yellow busses combine all signal types and require other methods (i.e., variable labeling) to
differentiate signals to provide information to the model developers.

- Variable labeling as proposed by B.? But this variable labeling is not showcased sadly.

> Sub-busses are specific to a subsystem and cannot have additional sub-busses defined within them

- Per in-house convention, not Modelica spec?
- They extend base expandable connectors definition for each subsystem.

> Once the specific subsystems are chosen, the modeler creates the appropriate connections/boundary conditions while the signal bus connections are automatically accounted for due to the nature of the expandable connector.

- So physical connectors are connected manually. Why not use conditional connectors?

> 1. Duplicate/copy the SubSystem_Category package into the NHES.Systems package and name it PrimaryHeatSystem. 2. Under the newly created PrimaryHeatSystem package, rename SubSystem_Specific to IRIS.

- So they have a template for creating the templates!

What motivates the use of records as opposed to a flat declaration of the parameters for each subsystem? (There seems to be only one record per subsystem so this only adds another depth layer in the parameter dialog box, for what benefit?)


## 9/9 Iteration with Devetry

Erik Wiffin: VP of engineering will join

Scenario that will grab other systems: factor in what the design would like, wires follow a realistic flow...

All options fleshed out should be fleshed out in spreadsheet


## 9/1 Iteration with Devetry

Modelon role and contribution

Core Linkage workflow = form based

- Export CDL and CXF that can be used in other tools

- 1st pathway: Export in OMEdit

- 2nd pathway

  - API to assemble whole system models (access whole library)
  - Keep Linkage free from compiler: constrainedby etc. replaceable classes must be supported by Linkage natively (w/o calling mo compiler)

Modelon likely to become SAS company with low cost access.

- Full-featured editor ~ similar price as Dymola
- Order of magnitude less if only API used

"Semla" option: encrypted output specified by Modelon, adopted by OM, freeze output from Linkage

Tight integration with Modelica tool through API?

- What could that look like?
- Modelon would want an API integration (REST API existing): theirs into Linkage
  - From Modelon point of view: early in journey of offering web app.
    - Minimalistic integration of Linkage into impact, integration surface very small
    - If impact wants to support the HVAC workflow: add button that invokes Linkage API to export CXF, Word

Hard point

- Overall workflow once controls are configured for building

Importing back to Linkage should be supported, provided the user does not modify the annotations, etc. But the schedule, etc. may be broken. A lot should work.



## 7/20 Documentation export with m2j

4 level or editing

1. faithful to standard
2. deviation from standard both in CDL and doc
3. deviation between CDL and doc

Modification of documentation not planned in Phase 1

- Use in Phase 2

If value not input through Equ. schedule in Linkage: output TBD

For the schedule, use the annotation at the parameter declaration level that flags if provided by designer of commissionning agent.



## 6/21 Linkage Internal with Michael, Jianjun, Baptiste

Arrays are needed in CDL

- But pushed back by industry & 223P
- Keep it for now

Routing component

- use for loops in parameter declaration OK, but not in equation section
- target CDL compliant

`Buildings.Templates.AHUs.Controls.Guideline36`

- May not be compliant with CDL, but
- Implement a high level description such as in `Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.VAV.Controller`
- But with better structure for each §
  - High-level description
  - It is based on G36
  - Link to CDL class
- Annotation to specify which block needs to be included/excluded from translation.
- This whole block will only be included as part of the documentation.
- All block related to zones should be in the terminal unit control block and thus instantiated as scalar VS array, such as `zonOutAirSet`

Note that m2j outputs documentation in the same order as instantiation order, so instantiate consistently.

For parameter propagation

- need to evaluate all parameter bindings
  - ***need to run a Modelica tool on the full model and parse the result file!!!***
- OR have Linkage evaluate them (as they need to be for the Schedule generation) and output in JSON (read-only) so that m2j can access them

Open issues on documentation

- Variable names differ
- No permanent hyperlink to reference G36
- Conversion from description to specification ("shall")
  - Be consistent and keep description wording in Modelica


## 6/2 Modelica-json

Jianjun mentions timeline for reverse translator to end of June (challenging).

AHU template into

! MSL needs to be translated! Even higher priority than MBL

- SIUnits
- Modelica.Fluid.Interfaces
- Media

2 ways to deal with Java dependency

- Move all to Java
- Move all to JS

Java can be embeded (Wazam) and run into the browser

Hard to maintain the 2 languages in the long term


## Schedules

Brent Eubanks

> there is the need to be able to provide inputs but flag them as "approximate" or "not final" or similar.  This would enable the designer to start using the tool earlier (and thus incorporating it into their construction document generation workflow).  During DD they could build out the zone table with box sizes and approximate setpoints (nearest 1000 CFM), with the intention of going back to update those values later.

Variables used as parameters


## 5/26 Linkage check-in

Landing page:

- logo, little text
- stubs and placeholders for onboarding content
- load project / start new

- onboarding process: out of scope but needed,

Timeline / modelica-json

1. pedantic and hard to consume schema: reevaluate that schema and use more condensed format
2. More templates, more complex
3. Chiller plant

Phase 1 in between POC and MVP

End of July
- One template of chiller plant (one configuration)

Testing purposes:

- JSON to modelica = high priority! Out put `mo` code instead of HTML.




## 5/19 Wireframes with Devetry (Jesse Stevens: Designer)

Decide on the schedule structure

Do not condition choices of energy code to location, expose full list

Argument for box within terminal unit and not bundled under VAV: multiple VAV config can use the same reheat box config

Data record could be developed in Modelica and used to populate that screen with general information.


## Spec

Specify the depth level of composition to facilitate the UI integration: see for instance the indent level of collapsible sections, if it exceeds that level then flatten.


## Template

Symbols

- HVAC
  - EN 12792:2003 Ventilation for buildings. Symbols, terminology and graphical symbols
  - DIN 1946-1, 1988 Edition, October 1988 - Heating, ventilation and air conditioning; terminology and graphical symbols (VDI code of practice)

- Industrial / process (P&ID)
  - ANSI/ISA-5.1 ISO 14617-6 and ISO 10628 Instrumentation Symbols And Identification
    > The identifications consist of up to 5 letters. The first identification letter is for the measured value, the second is a modifier, 3rd indicates passive/readout function, 4th - active/output function, and the 5th is the function modifier. This is followed by loop number, which is unique to that loop. For instance FIC045 means it is the Flow Indicating Controller in control loop 045. This is also known as the "tag" identifier of the field device, which is normally given to the location and function of the instrument. The same loop may have FT045 - which is the flow transmitter in the same loop.
  - P&ID signs- ISO 3511 and DIN 19 227
  - Process control - ISO 3511 and DIN 19 227

- Library from Taylor -> G36

### TODO:

- In `Buildings.Templates.BaseClasses.Controls.AHUs.SingleDuct` the outer component declaration can make pedantic check fail due to partial medium (Dymola does not detect that the corresponding inner instance is redeclared together with the medium).

- [ ] Check with Paul if isolation dampers are used in addition to economizer damper, or are the OA and EA dampers used to that means?

- [ ] Add `port_a(
    redeclare final package Medium = Medium,
     m_flow(min=if allowFlowReversal then -Modelica.Constants.inf else 0),
     h_outflow(start = Medium.h_default, nominal = Medium.h_default))` to `Buildings.Templates.Interfaces.AHU` for CHW and HHW ports?


- Specify how to guard against incompatible choices at *configuration* time (i.e., without Modelica compiler, so cannot rely on assert statements). Conditional choices are not enough: for instance an ulterior selection might invalidate a previous selection (cf. circular dependency). Relate to the need to store some "hints" or pointers to documentation: where is that data hosted?
  - Use standard assert statements and require that Linkage interpret them dynamically?

- How to put performance data records (fans, DX, etc.) in `systems.json`

- Decide to lump or distribute dp
  - For the liquid side: if no actuator, then in HX, else in dpFixed

- Nonactuated barometric relief only
  - Need to develop a damper model similar to check valve

- Economizer interlocked dampers as a separate block just constraining the signals


### Use of JSON parameter file

- Array size: `Current version of the Modelica translator can only handle array of components with fixed size. But component ahu.fanSupDra.fan had non-fixed array dimensions [nFan]`
- Test variable size array in JSON file considering https://github.com/modelica-3rdparty/ExternData/issues/34
  - See also Michael's feedback on Spawn
  - Also annotation `__Dymola_translate=true`
- Nominal attribute evaluated: need for development
  - Yields a lot of warning such as `Non-literal value. In nominal attribute for ahu.coiCoo.hex.hex.ele[4].preDro2.dp`
- (Expressions and references to other variables to be handled from the JSON generator environment, for instance Excel...)


### Notes

`__Linkage(enable=...)` could be replaced with a parameter `isModCtrSpe=true` and a standard `Dialog(enable=isModCtrSpe and ...)`.

Wrapper classes allow easier reconfiguration (through parameter binding, without the need for vendor annotation).

  - The main issue is mainly changing the parameter set, as `Dialog(enable=...)` does not handle unassigned parameters (with no default) and conditional components can only be used in connect statements (so not for in parameter binding).
    - Or at initialization with `fixed=false`.
  - As opposed to a replaceable component which adds its own set of parameters: the parameters from another configuration do not exist in the actual variable scope.

One zone for one terminal unit. Terminal units are indexed (in Modelica array) according to the order provided in
```
        "Terminal unit identifiers": [
            "Box_1"
        ],
```
and assigned to `final parameter String idTerArr[nZon]`

- The bus architecture is devised for modeling, does not reflect the real system bus architecture (only "mimics"): we use an array of terminal unit bus, whereas a real system register each terminal point to a single point in a flat bus.

- `NoConnection` damper with zero flow condition instead of removable ports allows having other components in series (such as for the dedicated OA branch), otherwise all those components should also be removed when disabling the connection.

- The location (supply or return branch) is either specified at instantiation through a type assignment (for sensors) or inferred from the instance name (fans). In  the latter case a string is used for simplicity when parsing the parameter JSON file.
- The inference from the instance name is also used for the coil function: cooling, heating, etc.
- No support for preheat coil in OA branch: configuration not present in ASHRAE2006 nor G36 nor Trane

- About expandable connector arrays

  > Introducing elements in an array gives an array with at least the specified elements, other elements are either not created or have a default value (i.e. as if they were only potentially present).

  > An expandable connector array component *(an array component within an expandable connector)* for which size is not defined (see section 10.3.1) is referred to as a sizeless array component. Such a component shall not be used without subscripts, and the subscripts must slice the array so that the sizeless dimensions are removed.

### RULES

1. Do not use conditional connect clauses, but rather conditional components: more readable and better supported, see for instance bug in Dymola: connect clauses inside conditional blocks are not compatible with automatic removal when the component is conditionally removed. Works with OCT.

   - Exception: for connections conditional input signal to control buses, such as

1. > Prefixes input, output, inner, outer, flow are not allowed in a record (Modelica spec 3.0)


### OBC sequence

Try to harmonize enumerations with `Buildings.Templates.Types.OutdoorSection` and `Buildings.Templates.Types.ReliefReturnSection` from branch `issue1374_templates`.

In `Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.VAV.Controller` the status of supply and return part must be an input, do not connect `supFan.y` to `sysOutAirSet.uSupFan`.

In `Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.VAV.SetPoints.OutdoorAirFlow.Zone` uReqOutAir: True if the AHU supply fan is on and the zone is in occupied mode

- Perhaps use 1 input point (fan return status) and 1 software point (zone mode)

TZonHeaSet: Zone air temperature heating setpoint, and cooling equivalent are averaged to compute the SATSP when fan status 0

- This is not consistent with G36 using
  > During cooldown mode, set point shall be Min_ClgSAT. During warm-up and setback modes, set point shall be 35°C (95°F).

- Where is the use of the average value specified in G36?

- And not explained in documentation

VOut_flow: no option for dp_Out

The logic for set point adjustment is cumbersome: why not use only 2 parameters

- Does the zone has set point adjustment
- Can cooling and heating set point be adjusted independently?

Currently it is not clear why cooAdj=true and heaAdj=true is needed to represent "Flag, set to true if both cooling and heating setpoint are adjustable separately".

uWin = true for window open, false for window closed: probably the opposite in real systems (dry contact) or configurable (normally open / normally closed): best would be to add an additional Boolean parameter to chose between normally open or normally closed sensor.

In `Buildings.Controls.OBC.ASHRAE.G36_PR1.TerminalUnits.Controller` and `Buildings.Controls.OBC.ASHRAE.G36_PR1.TerminalUnits.Reheat.DamperValves`
the use of TSup (Supply air temperature from central air handler) is incorrect

 - Description string needs to be corrected.
 - `Buildings.Examples.VAVReheat.Guideline36` needs to be corrected.
> From 0% to 50%, the heating-loop output shall reset the
discharge temperature set point from the current AHU
SAT ***set point***

In `Buildings.Controls.OBC.ASHRAE.G36_PR1.Generic.SetPoints.ZoneStatus` the occupied/unoccupied set points should be input (software points) not parameters (as in `Buildings.Controls.OBC.ASHRAE.G36_PR1.TerminalUnits.SetPoints.ZoneTemperatures`).
See also:
> 5.1.10 All set points, timers, deadbands, PID gains, etc.
listed in sequences shall be adjustable by the user with appropriate
access level whether indicated as adjustable in sequences
or not. Software points shall be used for these variables. Fixed
scalar numbers shall not be embedded in programs except for
physical constants and conversion factors.

In `Buildings.Controls.OBC.ASHRAE.G36_PR1.TerminalUnits.Controller`

- has no default for `samplePeriod` as opposed to `Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.VAV.Controller`
- text for connector `yDam_actual` is `uDam_actual`: use `uDam_actual` for the connector variable.
- `parameter Real CO2Set=894 "CO2 setpoint in ppm"` should be software point


Various economizer configurations not handled: yDamRel (or exhaust), yDamOutMin

Various fan configurations not handled: yFanRet (or relief)

Freeze protection?

Economizer high-limit in `Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.VAV.Controller`

- If using a fixed value, must be computed internally based on based on energy standard, climate zone, and economizer high-limit-control device type
- > §3.1.6.2: The control logic will automatically select the correct set
points based on thermal zone and high-limit type selected.
- Options may be
iii. Fixed dry bulb + differential dry bulb
iv. Fixed enthalpy + fixed dry bulb
v. Differential enthalpy + fixed dry bulb
- So 1 connector `TOutCut` is not enough


5.15 Air-Handling Unit System Modes

> When zone group served by
an air-handling system are in different modes, the following
hierarchy applies (highest one sets AHU mode):
a. Occupied mode
b. Cooldown mode
c. Setup mode
d. Warm-up mode
e. Setback mode
f. Freeze protection setback mode
g. Unoccupied mode

Currently this logic is not implemented anywhere.

Personal notes:

> A “request” is a call to reset a static pressure or
temperature set point generated by downstream zones or airhandling
systems. These requests are sent upstream to the
plant or system that serves the zone or air handler that generated
the request.
a. For each downstream zone or system, and for each type of
set-point reset request listed for the zone/system, provide
the following software points:

> It’s recommended to use a global outdoor air temperature
not associated with any AHU to determine warm-up start
time. This is because unit-mounted OA sensors, which are
usually placed in the outdoor air intake stream, are often
inaccurate (reading high) when the unit is OFF due to air
leakage from the space through the OA damper.

### COMPLEXITY

> Airflow tracking requires a measurement of supply airflow
and return airflow. Figure 6.9 shows AFMS at both fans.
These are actually not mandatory, although they may improve
accuracy if properly installed. The supply airflow can be calculated
by summing VAV box airflow rates. Return airflow
can be approximated by return-fan speed if there are no
dampers in the return air path (the geometry of the return air
system must be static for speed to track airflow.)

> Relief fans are enabled and disabled with their associated
supply fans, but all relief fans that are running and serve a
common volume of space run at the same speed. All operating
relief fans that serve a common/shared air volume shall be
controlled as if they were one system, running at the same
speed and using the same control loop, even if they are associated
with different AHUs.

> Injection fan with volume control


## OLD - Modelica-Based Templating: merged in spec

- [x] Package all replaceable records into one "master" record
  - This is not straightforward as the record *types* declared in the AHU depend on local structural parameters. So even if we package them into a master record, the latter cannot live outside of the AHU class. So that does not help the propagation from a record declared at a top-level.
    - We would need a mechanism to enable binding the *types* of the inner records of the top-level record to the record types redeclared at the AHU level and then just propagate the parameter binding for these types (which is easily done by reintroducing an instance of each record type in the AHU class).

- [x] Connection to the control bus requires different variable names for the heating coil `yCoiHea` and the cooling coil `yCoiCoo` or for the supply fan `yFanSup` and the return fan `yFanRet`: currently this requires different classes.
  - Alternative: use conditional connect equations.
  - Solved by adding an additional structural parameter pertaining to the "function" of the equipment.
- [x] Test case with `fixed=false`
- [x] Minimum example for `outer replaceable` failing with OCT.
- [x] Is the terminal sub-bus really needed within the AHU bus?
  - Apparently no: refactored by using local definition of AHU bus without the terminal sub-bus.

Components to test

- [x] Economizer
- [x] Cooling coil + actuator
- [x] Supply fan (2 positions, fan array)
- [x] Controller and control bus
  - [ ] Test with G36 controller?

## Requirements

Flag (color code) components with missing parameters (no default) or best-guess default values that need to be refined (based on user selection?).

modelica-json

- :warning: Since `choicesAllMatching` may be used a lot: the performance for discovering class subtypes (possibly through multiple extends or record constructor function calls like `record A = B(...);`) given a constraining class is critical regarding the UX.

  - The discovery relies mainly (but not only) on classes within the `Templates` package though.
  - We have a fixed library (as opposed to a development tool) that can be pre-parsed.
  - Fall back on a literal enumeration of choices (see `choices` annotation).

## Notes

What speaks against a packaged record for the whole AHU at the AHU interface class level:

- Parameters pertaining to each equipment will not be at the same level (group) of the equipment enumeration in the UI.
- The record must contain only constant declarations so that the types that it declares can be accessible through
 [Composite Name Lookup](https://specification.modelica.org/maint/3.5/scoping-name-lookup-and-flattening.html#composite-name-lookup) (otherwise restricted to encapsulated elements only).

The declaration of the record for each equipment is required for propagation. Using only the record **type** is fine as long as long as parameter setting is done only through the UI, i.e., within a redeclare statement.

- Need to test again `fixed=false` to validate the propagation mechanism.
- A record type which is redeclared (non replaceable) in a derived class is no more visible in instances of the class with Dymola UI.

Support for nested replaceable?

- For instance `DedicatedDamper` does not inherit from `CommonDamper` so that `typ` is final in both. (Also limits the complexity.)
- But the coil should offer the option to redeclare the actuator.

### Parameters

`Buildings.Experimental.Templates.AHU.Economizers.Data.AlternativeGeneric` illustrates the issue of parameters with no default: even if conditionally removed they will cause the translation to fail.

Hence the approach of replaceable records.
- If a parameter has no default, assigning a value at top-level is fine.

:warning: Limitation

> An element declared with the prefix outer references an ***element instance with the same*** name but using the prefix inner which is nearest in the enclosing instance hierarchy of the outer element declaration.

> - This propagates to any inner component that uses this record, for instance the economizer `outer parameter Coils.Data.CoolingWater datCoiCoo`

- We need different classes only to have different instance names for the parameter record. So two different classes are needed for instance to template the supply and return fan, just so that one can declare `datFanSup` and the other `datFanRet`...

#### Difference with `Buildings.HeatTransfer.Conduction.BaseClasses.PartialConstruction`

Here we need to propagate a parameter record such as `datEco` from a top-level AHU model to the inner component `eco`. This cannot rely on a simple parameter binding and an additional variable pointing to the *class name* of the record must be introduced. (Note that the parameter assignment can be done directly through this variable though.)

Whereas `Buildings.HeatTransfer.Conduction.MultiLayer` simply *extends* `Buildings.HeatTransfer.Conduction.BaseClasses.PartialConstruction` so the replaceable record declared in the latter in naturally exposed in the former.

### Declaration order

Annotating a replaceable component with `Dialog(group=STRING)` will cause the enumeration to be rendered under the group `STRING` which is good. However we would like it to be the first item under this group.
- Alternative: use `Configuration` as the group to host all structural parameters.


### Interface class and subtyping

> From Hubertus
Antoine and Michael: I suggest to use the (not yet released) Modelica Specification 3.5 since a large number of text improvements and clarifications went into this (compared to 3.4). This should be the final spec, that is simply not yet voted on. Here is the link: https://specification.modelica.org/maint/3.5/interface-or-type-relationships.html#plug-compatibility-or-restricted-subtyping


Declaration of the record at the interface level

```modelica
  outer replaceable parameter Economizers.Data.None datEco
    annotation (Placement(transformation(extent={{-10,-98},{10,-78}})));
```

Yields an error with OCT

```
Error at line 13, column 35, in file '/home/agautier/gitrepo/modelica-buildings/Buildings/Experimental/Templates/AHUs/Economizers/CommonDamperTandem.mo':
  Cannot use component dpDamRec_nominal in inner 'redeclare Economizers.Data.CommonDamperTandem datEco(mExh_flow_nominal = 1)', because it is not present in outer 'outer replaceable parameter Economizers.Data.None datEco'
```


## Meeting with Modelon

Declaration of interface record in interface class not supported: see minimum example.