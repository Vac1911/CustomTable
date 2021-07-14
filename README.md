## Configuration
### Templates

Explanation needed

### Properties

| pagesize  | Sets the number of records per page                          |
| --------- | ------------------------------------------------------------ |
| sortprop  | Sets the initial property to sort records by                 |
| sortdir   | Sets the initial direction to sort records by                |
| selectmax | Sets the maximum number of unique values for a field to be automatically given a select |



## Columns
### Prop
Each column maybe assigned a property name. This property is used as the key to find values when sorting or filtering. Without the property name, the column cannot be sorted or filtered.

Property names are assigned by using the attribute `data-prop` in the head template.

```html
<template slot="thead">
 <tr>
  <th data-prop="carNum">Stock No.</th>
  <th data-prop="carYear">Year</th>
  <th data-prop="mfg">Coach</th>
  <th data-prop="carTrim">Trim</th>
  <th data-prop="carType">Type</th>
  <th data-prop="carColorExt">Color</th>
  <th data-prop="carStatus">Status</th>
  <th></th>
 </tr>
</template>
```



### Type
Columns can be assigned any JSON Data Type. These types include: *string*, *number*, *object*, *array*, or *boolean*. If no type is explicitly assigned, the table will automatically assign a type based on values in the column, assuming the column has a property name. Usually the type will not need to be set.

Property names are assigned by using the attribute `data-type` in the head template. For the column type to have any impact on behavior, it must be accompanied by a property name.

```html
<template slot="thead">
 <tr>
  <th data-prop="carNum" data-type="string">Stock No.</th>
  <th data-prop="carYear" data-type="number">Year</th>
  <th data-prop="mfg" data-type="object">Coach</th>
  <th data-prop="carType" data-type="string">Type</th>
  <th></th>
 </tr>
</template>
```

Every type allows for *null* values, and empty *strings*, *arrays*, or *objects* will be treated as if they are null. *Boolean* columns with *null* values will treat them differently than *false*, and *number* columns will treat *null* values differently than *0*.

### Filtering
Column filtering supports multiple input methods: *text*, *select*, *select-many*, and *none*. Filtering is currently only supported for the column types: *string* and *number*. If not explicitly assigned, the table will automatically assign a method based on the number of unique values in the column. Across all methods, the filter is committed on the "change" event.

The behavior of the *text* method changes based on the column type. 
**String** columns can be filtered by matching a case insensitive substring (ex: input "gray" would match "Gray" and "Dark Gray" but not "Green") or a simple case insensitive Regex expression (ex: input "^gray$" would match. "Gray" but not "Dark Gray" nor "Green").
**Number** columns can be filtered with comparisons such as ">2000" or an exact match (ex: input "200" would match "200" but not match "2000").

The *select* method requires an exact match to the chosen option. Options are automatically generated based on unique values in the table including an "ALL" option to reset the filter. It is recommended you use *select* with fields who have a semi-fixed number of unique non-numeric values.

Similarly *select-many* requires an exact match to a chosen option, however multiple options can be chosen. Options are automatically generated based on unique values in the table including an "ALL" option to reset the filter. It is recommended you use *select* with fields who have a semi-fixed number of unique non-numeric values.

Property names are assigned by using the attribute `data-search` in the head template. For column filtering to be enabled the column must also have property name.

```html
<template slot="thead">
 <tr>
  <th data-prop="carNum">Stock No.</th>
  <th data-prop="carYear" data-search="text">Year</th>
  <th data-prop="mfg" data-search="select">Coach</th>
  <th data-prop="carTrim">Trim</th>
  <th data-prop="carType">Type</th>
  <th data-prop="carColorExt" data-search="select-many">Color</th>
  <th data-prop="carStatus">Status</th>
  <th></th>
 </tr>
</template>
```
## Rows
### Templating

Explanation needed

