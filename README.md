# Model Metadata


This library is intended to encapsulate validation and business logic. It should not be coupled to any specific project, and be compatible with any front end / back end framework.

---

## Installation

```bash
git clone https://github.com/mheirendt/model-metadata
```

---

## Usage

### Validation

ModelBuilder is the fastest way to validate an input. It encapsulates the functionality within the Model base class. Use ModelBuilder for quickly validating inputs that are not expected to be re-used. For concrete business logic, it is recommended to subclass Model and add concrete properties.

```TypeScript

import { ModelBuilder } from '@mheirendt/model-metadata';

// Create a new builder
const builder = new ModelBuilder();

// Define a string property called 'name'
const name = builder.string('name');

// Require the property
name.required();

// Define a minimum length
name.min(2);

// Define a maximum length
name.max(20);

// Define a pattern that the name must adhere to
name.pattern(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/);

// Validate an input against the model
// If the input is invalid, error will be an object describing the issues with the input.
// If it is valid, error will be undefined.
// Value will be the input provided to the validate function
const {error, value } = builder.validate({name: 'Michael'}); // => error: undefined, value: {name: 'Michael'}

```

The same thing could be accomplished using a subclass

```Typescript

import { Model, Validators } from '@mheirendt/model-validation';

class User extends Model {
    
    // All validation can be applied declaratively through decorators, or functionally by calling the decorator function against the model instance
    @Validators.required
    @Validators.min(2)
    @Validators.max(20)
    @Validators.pattern(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/)
    name!: string;

    constructor(props?: Object) {

        // Assign a default value for name when calling new User() with no parameters
        props = Object.assign({
            name: ''
        }, props || {});

        super(props);
    }
}

const user = new User({name: 'm'});

const errors = user.errors();
/**
 * => {
 *  name: ['Minimum length of 2']
 * }
 * 
 */

```

### Conditional Validation

There may be times when validation on an input should be performed when a condition applies. This can be accomplished using ModelBuilder.

```TypeScript
import { ModelBuilder } from '@mheirendt/model-metadata';

// Create a new builder
const builder = new ModelBuilder();

// Define a required property 'name'
const name = builder.string('name').required();
const birthday = builder.date('birthday').required();

// Require additional info when user is under 21
const min = new Date();
min.setFullYear(min.getFullYear() - 21);
birthday.when('greater-than', min, (builder: ModelBuilder) => {
    builder.string('guardian').required();
});

const { error } = builder.validate({ name: 'Michael', birthday: new Date('01/01/2020') });
/**
 * yields => {
 *   guardian: ['Field is required']
 * }
 * 
 */

```