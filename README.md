# edl-genius &middot; [![Build Status](https://img.shields.io/travis/bradcordeiro/edl-genius)](https://travis-ci.org/bradcordeiro/edl-genius) [![Coverage Status](https://coveralls.io/repos/github/bradcordeiro/edl-genius/badge.svg?branch=master)](https://coveralls.io/github/bradcordeiro/edl-genius?branch=master) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/your/your-project/blob/master/LICENSE)

An ES6 module to parse Edit Decision Lists. Currently, only CMX 3600 EDLs are supported, but I plan to include support for File129.

## Installing / Getting started

  ```shell
  $ npm install --save edl-genius
  ```

  ```javascript
  const EditDecisionList = require('edl-genius');

  let e = new EditDecisionList(29.97, 'cmx3600');
  edl.readFile('/path/to/your/edl')
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
      sourceFile: 'ACC112 WARBIRDS'
      transitionTo: 'ACC118 BATTLEPIGS.NEW.01 },
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

The goal is to have 100% test coverage of all edge cases. Tough when you're dealing with EDLs, a text exchange format that some vendors deviate from. All pull requests are welcome, and if you'd like to submit a pull request with additional tests, without changing the package code, that's totally cool.

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

## API Reference

The goal of this module is really just to get information out of a text EDL and into JavaScript native data types. Each class defined by this module is really just object storage, with methods to get the information into those objects.

Timecode objects are created using [timecode-boss](https://github.com/bradcordeiro/timecode-boss/) module, which I also wrote. You can check its repository for its API. A common method of Timecode objects you'll probably want to use is *toString()*.

#### EDL Class

Constructor |
----------- |
new EDL(frameRate : Number, type : String) |
Returns an empty EDL, with its record frame rate set to the argument. The record frame rate defaults to 29.97 (a.k.a. 30 drop-frame) if omitted, and type defaults to 'cmx3600'. The record frame rate is the frame rate of the sequence the EDL represents, as opposed to the frame rate of the source material in it, which is parsed by this package. |

##### Properties

Name | Type | Description
------ | ------------- | -----------
frameRate | Number | The record frame rate (i.e. the frame rate of the video sequence the EDL describes)
events | [Event] | An array of Events found in the EDL. (See Event class description below)

##### Methods

Method | Argument Type | Return Type | Description
------ | ------------- | ----------- |------------
readFile(*file*) | String | Promise | Reads the file argument, and stores the found EDL Events in the EDL object's *events* property. The Promise Resolver is given *this*  as its argument.
fromString(string) | String | Promise | Parses a string, and stores the EDL Events in the EDL object's *events* property. The Promise Resolver is given *this*  as its argument.
toJSON(*stringify*) | Boolean | Object or String | Returns a JSON-strigifiable object if *stringify* is *false*, or a JSON string if *stringify* is *true*
filterDuplicateMultitrack() | *none* | EDL | Returns a new EDL with duplicate events removed (ignoring track number).

#### Event Class

##### Properties

For clarity, here is an example event that EDL could parse:

```
004  QEVL1GRN V2    C        01:31:44:03 01:31:44:12 01:00:02:24 01:00:03:01
M2   QEVL1GRN       037.5                01:31:44:03
* GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRI
* SON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302
* SOURCE FILE: QEVL1GRND130.MOV
* FROM CLIP NAME:  QEVL1GRND130.NEW.01
* TO CLIP NAME:  QEVL1ESCP001.NEW.01
```

Name | Type | Description | Example (referencing above event)
---- | ---- | ----------- | ---------------------------------
number | Number | The event number of the event in the EDL | 4 |
reel | String | A short (generally 8 character) name of the source clip. | QEVL1GRN |
trackType | String | A single character for the type of track (*V* for video, *A* for audio). | V |
trackNumber | Number | A track number, for EDLs that describe multi-track sequences. | 2 |
transition | String | A transition type, generally *C* for a cut, or *W000* for another transition.  | C |
sourceStart | Timecode | The start of the source clip for the event. | 01:31:44:03 |
sourceEnd | Timecode | The end of the source clip for the event. | 01:31:44:12 |
recordStart | Timecode | The start of the clip's position in the sequence | 01:00:02:24 |
recordEnd | Timecode | The end of the clip's position in the sequence | 01:00:03:01 |
motionEffect | MotionEffect | Any speed-change applied to the clip (see MotionEffect class below) | { reel: 'QEVL1GRN', speed: 37.5, entryPoint: 01:31:44:03 } |
sourceFile | String | The source file name for the source clip | QEVL1GRND130.MOV |
sourceClip | String | The clip name from the editing system that generated the EDL | QEVL1GRND130.NEW.01 |
toClip | String | If there is a transition from this clip to another, the clip name it transitions to | QEVL1ESCP001.NEW.01 | 
comment | String | Any miscellaneous comments added to the event in the EDL | GETTY IMAGES__QEVL1GRND130_UNDERGROUND_EL CHAPO TUNNELS_INTERIOR OF ALCATRAZ PRISON. ROW OF CELLS, CLOSE-UP OF CELL DOOR BARS, INSIDE OF JAIL CELL_180563302 |

#### MotionEffect Class

##### Properties

Name | Type | Description | Example (referencing above event)
---- | ---- | ----------- | ---------------------------------
reel | String | A short source reference for the clip | 'QEVL1GRN' |
speed | Number | The frame rate at which the source clip is to be played | 37.5 |
entryPoint | Timecode | The start time of the source clip being effected | 01:31:44:03


## Licensing

Released under the [MIT License](https://github.com/bradcordeiro/edl-genius/blob/master/LICENSE).
