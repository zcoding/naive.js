# Naive

## Directives

### n-if, n-else-if, n-else

conditional rendering:
```html
<div n-if="condition1"></div>
<div n-else-if="condition2"></div>
<div n-else></div>
```

### n-for

+ Usage: `alias in expression`
  - `alias` is always required
  - `expression` is expected to be a type of `Array`, `Object`, `number` or `string`
  - when iterating an object, it is recommended to provide `:key` width `n-for` whenever possible

array iteration:
```html
<div n-for="item in items" :key="id"></div>
<div n-for="(item, index) in items" :key="id"></div>
```

object iteration:
```html
<div n-for="value in object" :key="id"></div>
<div n-for="(value, key) in object" :key="id"></div>
<div n-for="(value, key, index) in object" :key="id"></div>
```

number range:
```html
<div n-for="n in 10"></div>
```

string iteration:
```html
<div n-for="s in 'string'"></div>
```

### n-model

+ Modifiers:
 - `.number`
 - `.lazy`
 - `.trim`

### n-on

+ Shorthand: `@`
+ Modifiers:
 - `.stop`
 - `.prevent`
 - `.once`
 - `.{keyCode | keyAlias}`

### n-bind

+ Shorthand: `:`

### n-show

### n-text

### n-html

## Instance Methods

### `$mount`

### `$destroy`

### `$nextTick`

## Lifecycle

+ `beforeCreate`
+ `created`
+ `beforeMount`
+ `mounted`
+ `beforeUpdate`
+ `updated`
+ `beforeDestroy`
+ `destroyed`
