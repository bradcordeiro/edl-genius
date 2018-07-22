# edl-genius &middot; [![Build Status](https://img.shields.io/travis/npm/npm/latest.svg?style=flat-square)](https://travis-ci.org/bradcordeiro/edl-genius) [![Coverage Status](https://coveralls.io/repos/github/bradcordeiro/edl-genius/badge.svg?branch=master)](https://coveralls.io/github/bradcordeiro/edl-genius?branch=master) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/your/your-project/blob/master/LICENSE)

An ES6 module to parse Edit Decision Lists. Currently, only CMX 3600 EDLs are supported, but I plan to include support for File129.

## Installing / Getting started

  ```shell
  $ npm install --save edl-genius
  ```

  ```javascript
  const EDL = require('edl-genius');

  let e = new EDL(29.97);
  edl.read('/path/to/your/edl')
    .then((edl) => {
      console.log(edl.events);
    })

  /*
  [ Event {
      sourceFrameRate: 29.97,
      recordFrameRate: 29.97,
      number: 1,
      reel: 'ACC112',
      trackType: 'V',
      transition: 'C',
      sourceStart: Timecode { frameRate: 29.97, frameCount: 197203 },
      sourceEnd: Timecode { frameRate: 29.97, frameCount: 197400 },
      recordStart: Timecode { frameRate: 29.97, frameCount: 107892 },
      recordEnd: Timecode { frameRate: 29.97, frameCount: 108089 },
      sourceClip: 'ACC112 WARBIRDS.NEW.01',
      sourceFile: 'ACC112 WARBIRDS' },
    Event {
      sourceFrameRate: 29.97,
      recordFrameRate: 29.97,
      number: 2,
      ...
  */
  ```

## Developing

### Built With

This package was built in an environment running Node.js 10.0.0. [Travis CI](https://travis-ci.org/bradcordeiro/edl-genius) is used to check builds against the latest Node.js and the latest LTS release of Node.js (10.7.0 and 8.11.3 as of this writing).

The only development dependencies are packages needed for testing and linting. I use [Mocha](https://mochajs.org) for testing and [Istanbul](https://istanbul.js.org) to check test coverage.

### Setting up Dev

```shell
git clone https://github.com/bradcordeiro/edl-genius.git
cd edl-genius/
npm install
```

## Versioning

This package uses [Semantic Versioning](https://semver.org).

## Tests

The goal is to have 100% test coverage of all edge cases. Tough when you're dealing with EDLs, a text exchange format that some vendors deviate from. I would be grateful for test-only pull requests.

```shell
npm test
```
To run the tests using Mocha.

```shell
npm run test-coverage
```

To get a code coverage report.


## Style guide

This package was written using the [Airbnb Style Guide](https://github.com/airbnb/javascript). An [.eslintrc.json] file is included in source control, and [ESLint](https://eslint.org) as well as the [Airbnb plugin](https://www.npmjs.com/package/eslint-config-airbnb) are included as development dependencies.

## Api Reference

The goal of this module is really just to get information out of a text EDL and into JavaScript native data types. Each class defined by this module is really just object storage, with methods to get the information into those objects.

#### EDL Class

Constructor |
----------- |
new EDL(frameRate : Number) |
Returns an empty EDL, with its record frame rate set to the argument. The record frame rate defaults to 29.97 (a.k.a. 30 drop-frame) if omitted. The record frame rate is the frame rate of the sequence the EDL represents, as opposed to the frame rate of the source material in it, which is parsed by this package. |

##### Properties

Property | Type | Description
------ | ------------- | -----------
frameRate | Number | The record frame rate (i.e. the frame rate of the video sequence the EDL describes)
events | [Event] | An array of Events found in the EDL. (See Event class description below)

##### Methods

Method | Argument Type | Return Type
------ | ------------- | -----------
read(*file*) | String | Promise

Reads the file at the passed location asynchronously, and stores the found EDL Events in the EDL object's *events* property. The return value's Promise Resolver is given the EDL object as its argument.

#### Event Class

Constructor |
----------- |
new Event(input : String, sourceFrameRate : Number, recordFrameRate : Number) |
Parses the passed string into class properties, using the sourceFrameRate for source timecodes and recordFrameRate for record timecodes. If called with no arguments, an empty Event is created, whose properties can be set manually. IF no sourceFrameRate or recordFrameRate are passed, they default to 29.97. |

## Licensing

Released under the [MIT License](https://github.com/bradcordeiro/edl-genius/blob/master/LICENSE).
