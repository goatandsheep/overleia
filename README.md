# Overleia

> Simplified picture-in-picture library for Node JS


[![npm version](https://badgen.net/npm/v/overleia)](https://www.npmjs.com/package/overleia)
[![codecov](https://badgen.net/codecov/c/github/goatandsheep/overleia)](https://codecov.io/gh/goatandsheep/overleia)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo)
[![npm downloads](https://img.shields.io/npm/dt/overleia.svg?style=flat-square)](https://www.npmjs.com/package/overleia)

## Breaking changes

### Dependencies

From 1.x to 2.x we've changed our ffmpeg library from being ecmascript compiled to being wasm compiled. The benefit being better library support and that this is a fully-featured build and that it has better browser support. The caveat is that it requires experimental node flags that you can see from the npm command `next`:

> `node --experimental-wasm-threads --experimental-wasm-bulk-memory test/basic.js`

## Functions

<dl>
<dt><a href="#PipLib">PipLib(params, directory)</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ViewInput">ViewInput</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#TemplateInput">TemplateInput</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#OverleiaInput">OverleiaInput</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="PipLib"></a>

## PipLib(params, directory)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| params | [<code>OverleiaInput</code>](#OverleiaInput) |  |
| directory | <code>String</code> | maximum 1 slash |

<a name="ViewInput"></a>

## ViewInput : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>Number</code> |  |  |
| y | <code>Number</code> |  |  |
| height | <code>Number</code> |  |  |
| [width] | <code>Number</code> |  | optional to maintain ratio |
| [delay] | <code>Number</code> | <code>0</code> |  |

<a name="TemplateInput"></a>

## TemplateInput : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| height | <code>Number</code> |  |
| [width] | <code>Number</code> | optional to maintain ratio |
| views | [<code>Array.&lt;ViewInput&gt;</code>](#ViewInput) |  |

<a name="OverleiaInput"></a>

## OverleiaInput : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| inputs | <code>Array.&lt;String&gt;</code> |  | file paths |
| template | [<code>TemplateInput</code>](#TemplateInput) |  |  |
| [filetype] | <code>String</code> | <code>&quot;mp4&quot;</code> |  |
| verbose | <code>Boolean</code> |  |  |

