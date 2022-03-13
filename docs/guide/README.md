# Guide

:warning: Work in progress...

Variables accessible at top-level of each template class

- Design parameters
- All possible connectors
- Parameter record

Icons

Control point connections

Master record

- Which parameters should be exposed?


## Icons

Original icons used in are available in an SVG file at


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


## AHU

Nota: inner/outer for parameters allows implicit propagation, very useful if the redeclared component uses parameters not declared in the constraining class

## TODO

Bus, model or record for simulation output variables

Pressure parametrization

- Filters DP used only for alarming, include in schematic, do not model?

Test class parameterization with records

parameter RecordCoil dat = if coiCoo.typ == CoiCooling then RecordCoolingCoil else...


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


## Iterations with Baptiste

:warning: Dymola manages graphical feedback if type assignment does not require class name lookup. USE full class name!


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
