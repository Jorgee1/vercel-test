"use strict";
(() => {
  // node_modules/@trpc/server/dist/TRPCError-226f5343.mjs
  function getMessageFromUnknownError(err, fallback) {
    if (typeof err === "string") {
      return err;
    }
    if (err instanceof Error && typeof err.message === "string") {
      return err.message;
    }
    return fallback;
  }
  function getErrorFromUnknown(cause) {
    if (cause instanceof Error) {
      return cause;
    }
    const message = getMessageFromUnknownError(cause, "Unknown error");
    return new Error(message);
  }
  function getCauseFromUnknown(cause) {
    if (cause instanceof Error) {
      return cause;
    }
    return void 0;
  }
  function getTRPCErrorFromUnknown(cause) {
    const error = getErrorFromUnknown(cause);
    if (error instanceof TRPCError) {
      return error;
    }
    const trpcError = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: error,
      message: error.message
    });
    trpcError.stack = error.stack;
    return trpcError;
  }
  var TRPCError = class extends Error {
    constructor(opts) {
      const message = opts.message ?? getMessageFromUnknownError(opts.cause, opts.code);
      const cause = opts.cause !== void 0 ? getErrorFromUnknown(opts.cause) : void 0;
      super(message, {
        cause
      });
      this.code = opts.code;
      this.name = this.constructor.name;
    }
  };

  // node_modules/@trpc/server/dist/codes-52c11119.mjs
  function invert(obj) {
    const newObj = /* @__PURE__ */ Object.create(null);
    for (const key in obj) {
      const v = obj[key];
      newObj[v] = key;
    }
    return newObj;
  }
  var TRPC_ERROR_CODES_BY_KEY = {
    /**
    * Invalid JSON was received by the server.
    * An error occurred on the server while parsing the JSON text.
    */
    PARSE_ERROR: -32700,
    /**
    * The JSON sent is not a valid Request object.
    */
    BAD_REQUEST: -32600,
    /**
    * Internal JSON-RPC error.
    */
    INTERNAL_SERVER_ERROR: -32603,
    // Implementation specific errors
    UNAUTHORIZED: -32001,
    FORBIDDEN: -32003,
    NOT_FOUND: -32004,
    METHOD_NOT_SUPPORTED: -32005,
    TIMEOUT: -32008,
    CONFLICT: -32009,
    PRECONDITION_FAILED: -32012,
    PAYLOAD_TOO_LARGE: -32013,
    TOO_MANY_REQUESTS: -32029,
    CLIENT_CLOSED_REQUEST: -32099
  };
  var TRPC_ERROR_CODES_BY_NUMBER = invert(TRPC_ERROR_CODES_BY_KEY);

  // node_modules/@trpc/server/dist/index-972002da.mjs
  var noop = () => {
  };
  function createInnerProxy(callback, path) {
    const proxy = new Proxy(noop, {
      get(_obj, key) {
        if (typeof key !== "string" || key === "then") {
          return void 0;
        }
        return createInnerProxy(callback, [
          ...path,
          key
        ]);
      },
      apply(_1, _2, args) {
        return callback({
          args,
          path
        });
      }
    });
    return proxy;
  }
  var createRecursiveProxy = (callback) => createInnerProxy(callback, []);
  var createFlatProxy = (callback) => {
    return new Proxy(noop, {
      get(_obj, name) {
        if (typeof name !== "string" || name === "then") {
          return void 0;
        }
        return callback(name);
      }
    });
  };

  // node_modules/@trpc/server/dist/config-6e96a9bc.mjs
  function getDataTransformer(transformer) {
    if ("input" in transformer) {
      return transformer;
    }
    return {
      input: transformer,
      output: transformer
    };
  }
  var defaultTransformer = {
    _default: true,
    input: {
      serialize: (obj) => obj,
      deserialize: (obj) => obj
    },
    output: {
      serialize: (obj) => obj,
      deserialize: (obj) => obj
    }
  };
  var defaultFormatter = ({ shape }) => {
    return shape;
  };
  var TRPC_ERROR_CODES_BY_NUMBER2 = invert(TRPC_ERROR_CODES_BY_KEY);
  var JSONRPC2_TO_HTTP_CODE = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    TIMEOUT: 408,
    CONFLICT: 409,
    CLIENT_CLOSED_REQUEST: 499,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    METHOD_NOT_SUPPORTED: 405,
    TOO_MANY_REQUESTS: 429
  };
  function getStatusCodeFromKey(code) {
    return JSONRPC2_TO_HTTP_CODE[code] ?? 500;
  }
  function getHTTPStatusCode(json) {
    const arr = Array.isArray(json) ? json : [
      json
    ];
    const httpStatuses = new Set(arr.map((res) => {
      if ("error" in res) {
        const data = res.error.data;
        if (typeof data.httpStatus === "number") {
          return data.httpStatus;
        }
        const code = TRPC_ERROR_CODES_BY_NUMBER2[res.error.code];
        return getStatusCodeFromKey(code);
      }
      return 200;
    }));
    if (httpStatuses.size !== 1) {
      return 207;
    }
    const httpStatus = httpStatuses.values().next().value;
    return httpStatus;
  }
  function getHTTPStatusCodeFromError(error) {
    const { code } = error;
    return getStatusCodeFromKey(code);
  }
  function omitPrototype(obj) {
    return Object.assign(/* @__PURE__ */ Object.create(null), obj);
  }
  var procedureTypes = [
    "query",
    "mutation",
    "subscription"
  ];
  function isRouter(procedureOrRouter) {
    return "router" in procedureOrRouter._def;
  }
  function isNestedRouter(procedureOrRouter) {
    return !("_def" in procedureOrRouter);
  }
  var emptyRouter = {
    _ctx: null,
    _errorShape: null,
    _meta: null,
    queries: {},
    mutations: {},
    subscriptions: {},
    errorFormatter: defaultFormatter,
    transformer: defaultTransformer
  };
  var reservedWords = [
    /**
    * Then is a reserved word because otherwise we can't return a promise that returns a Proxy
    * since JS will think that `.then` is something that exists
    */
    "then",
    /**
    * `_def` is a reserved word because it's used internally a lot
    */
    "_def"
  ];
  function createRouterFactory(config) {
    return function createRouterInner(procedures) {
      const reservedWordsUsed = new Set(Object.keys(procedures).filter((v) => reservedWords.includes(v)));
      if (reservedWordsUsed.size > 0) {
        throw new Error("Reserved words used in `router({})` call: " + Array.from(reservedWordsUsed).join(", "));
      }
      const newProcedures = {};
      for (const [key, procedureOrRouter] of Object.entries(procedures ?? {})) {
        const value = procedures[key] ?? {};
        if (isNestedRouter(value)) {
          newProcedures[key] = createRouterInner(value);
          continue;
        }
        if (isRouter(value)) {
          newProcedures[key] = procedureOrRouter;
          continue;
        }
        newProcedures[key] = procedureOrRouter;
      }
      const routerProcedures = omitPrototype({});
      function recursiveGetPaths(procedures2, path = "") {
        for (const [key, procedureOrRouter] of Object.entries(procedures2 ?? {})) {
          const newPath = `${path}${key}`;
          if (isNestedRouter(procedureOrRouter)) {
            recursiveGetPaths(procedureOrRouter, `${newPath}.`);
            continue;
          }
          if (isRouter(procedureOrRouter)) {
            recursiveGetPaths(procedureOrRouter._def.procedures, `${newPath}.`);
            continue;
          }
          if (routerProcedures[newPath]) {
            throw new Error(`Duplicate key: ${newPath}`);
          }
          routerProcedures[newPath] = procedureOrRouter;
        }
      }
      recursiveGetPaths(newProcedures);
      const _def = {
        _config: config,
        router: true,
        procedures: routerProcedures,
        ...emptyRouter,
        record: newProcedures,
        queries: Object.entries(routerProcedures).filter((pair) => pair[1]._def.query).reduce((acc, [key, val]) => ({
          ...acc,
          [key]: val
        }), {}),
        mutations: Object.entries(routerProcedures).filter((pair) => pair[1]._def.mutation).reduce((acc, [key, val]) => ({
          ...acc,
          [key]: val
        }), {}),
        subscriptions: Object.entries(routerProcedures).filter((pair) => pair[1]._def.subscription).reduce((acc, [key, val]) => ({
          ...acc,
          [key]: val
        }), {})
      };
      const router = {
        ...newProcedures,
        _def,
        createCaller(ctx) {
          const proxy = createRecursiveProxy(({ path, args }) => {
            if (path.length === 1 && procedureTypes.includes(path[0])) {
              return callProcedure({
                procedures: _def.procedures,
                path: args[0],
                rawInput: args[1],
                ctx,
                type: path[0]
              });
            }
            const fullPath = path.join(".");
            const procedure = _def.procedures[fullPath];
            let type = "query";
            if (procedure._def.mutation) {
              type = "mutation";
            } else if (procedure._def.subscription) {
              type = "subscription";
            }
            return procedure({
              path: fullPath,
              rawInput: args[0],
              ctx,
              type
            });
          });
          return proxy;
        },
        getErrorShape(opts) {
          const { path, error } = opts;
          const { code } = opts.error;
          const shape = {
            message: error.message,
            code: TRPC_ERROR_CODES_BY_KEY[code],
            data: {
              code,
              httpStatus: getHTTPStatusCodeFromError(error)
            }
          };
          if (config.isDev && typeof opts.error.stack === "string") {
            shape.data.stack = opts.error.stack;
          }
          if (typeof path === "string") {
            shape.data.path = path;
          }
          return this._def._config.errorFormatter({
            ...opts,
            shape
          });
        }
      };
      return router;
    };
  }
  function callProcedure(opts) {
    const { type, path } = opts;
    if (!(path in opts.procedures) || !opts.procedures[path]?._def[type]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No "${type}"-procedure on path "${path}"`
      });
    }
    const procedure = opts.procedures[path];
    return procedure(opts);
  }
  var isServerDefault = typeof window === "undefined" || "Deno" in window || globalThis.process?.env?.NODE_ENV === "test" || !!globalThis.process?.env?.JEST_WORKER_ID || !!globalThis.process?.env?.VITEST_WORKER_ID;

  // node_modules/@trpc/server/dist/transformTRPCResponse-7a73a2df.mjs
  function transformTRPCResponseItem(router, item) {
    if ("error" in item) {
      return {
        ...item,
        error: router._def._config.transformer.output.serialize(item.error)
      };
    }
    if ("data" in item.result) {
      return {
        ...item,
        result: {
          ...item.result,
          data: router._def._config.transformer.output.serialize(item.result.data)
        }
      };
    }
    return item;
  }
  function transformTRPCResponse(router, itemOrItems) {
    return Array.isArray(itemOrItems) ? itemOrItems.map((item) => transformTRPCResponseItem(router, item)) : transformTRPCResponseItem(router, itemOrItems);
  }

  // node_modules/@trpc/server/dist/resolveHTTPResponse-edf72fc7.mjs
  var HTTP_METHOD_PROCEDURE_TYPE_MAP = {
    GET: "query",
    POST: "mutation"
  };
  function getRawProcedureInputOrThrow(req) {
    try {
      if (req.method === "GET") {
        if (!req.query.has("input")) {
          return void 0;
        }
        const raw = req.query.get("input");
        return JSON.parse(raw);
      }
      if (typeof req.body === "string") {
        return req.body.length === 0 ? void 0 : JSON.parse(req.body);
      }
      return req.body;
    } catch (err) {
      throw new TRPCError({
        code: "PARSE_ERROR",
        cause: getCauseFromUnknown(err)
      });
    }
  }
  async function resolveHTTPResponse(opts) {
    const { createContext, onError, router, req } = opts;
    const batchingEnabled = opts.batching?.enabled ?? true;
    if (req.method === "HEAD") {
      return {
        status: 204
      };
    }
    const type = HTTP_METHOD_PROCEDURE_TYPE_MAP[req.method] ?? "unknown";
    let ctx = void 0;
    let paths = void 0;
    const isBatchCall = !!req.query.get("batch");
    function endResponse(untransformedJSON, errors) {
      let status = getHTTPStatusCode(untransformedJSON);
      const headers = {
        "Content-Type": "application/json"
      };
      const meta = opts.responseMeta?.({
        ctx,
        paths,
        type,
        data: Array.isArray(untransformedJSON) ? untransformedJSON : [
          untransformedJSON
        ],
        errors
      }) ?? {};
      for (const [key, value] of Object.entries(meta.headers ?? {})) {
        headers[key] = value;
      }
      if (meta.status) {
        status = meta.status;
      }
      const transformedJSON = transformTRPCResponse(router, untransformedJSON);
      const body = JSON.stringify(transformedJSON);
      return {
        body,
        status,
        headers
      };
    }
    try {
      if (opts.error) {
        throw opts.error;
      }
      if (isBatchCall && !batchingEnabled) {
        throw new Error(`Batching is not enabled on the server`);
      }
      if (type === "subscription") {
        throw new TRPCError({
          message: "Subscriptions should use wsLink",
          code: "METHOD_NOT_SUPPORTED"
        });
      }
      if (type === "unknown") {
        throw new TRPCError({
          message: `Unexpected request method ${req.method}`,
          code: "METHOD_NOT_SUPPORTED"
        });
      }
      const rawInput = getRawProcedureInputOrThrow(req);
      paths = isBatchCall ? opts.path.split(",") : [
        opts.path
      ];
      ctx = await createContext();
      const deserializeInputValue = (rawValue) => {
        return typeof rawValue !== "undefined" ? router._def._config.transformer.input.deserialize(rawValue) : rawValue;
      };
      const getInputs = () => {
        if (!isBatchCall) {
          return {
            0: deserializeInputValue(rawInput)
          };
        }
        if (rawInput == null || typeof rawInput !== "object" || Array.isArray(rawInput)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: '"input" needs to be an object when doing a batch call'
          });
        }
        const input = {};
        for (const key in rawInput) {
          const k = key;
          const rawValue = rawInput[k];
          const value = deserializeInputValue(rawValue);
          input[k] = value;
        }
        return input;
      };
      const inputs = getInputs();
      const rawResults = await Promise.all(paths.map(async (path, index) => {
        const input = inputs[index];
        try {
          const output = await callProcedure({
            procedures: router._def.procedures,
            path,
            rawInput: input,
            ctx,
            type
          });
          return {
            input,
            path,
            data: output
          };
        } catch (cause) {
          const error = getTRPCErrorFromUnknown(cause);
          onError?.({
            error,
            path,
            input,
            ctx,
            type,
            req
          });
          return {
            input,
            path,
            error
          };
        }
      }));
      const errors = rawResults.flatMap((obj) => obj.error ? [
        obj.error
      ] : []);
      const resultEnvelopes = rawResults.map((obj) => {
        const { path, input } = obj;
        if (obj.error) {
          return {
            error: router.getErrorShape({
              error: obj.error,
              type,
              path,
              input,
              ctx
            })
          };
        } else {
          return {
            result: {
              data: obj.data
            }
          };
        }
      });
      const result = isBatchCall ? resultEnvelopes : resultEnvelopes[0];
      return endResponse(result, errors);
    } catch (cause) {
      const error = getTRPCErrorFromUnknown(cause);
      onError?.({
        error,
        path: void 0,
        input: void 0,
        ctx,
        type,
        req
      });
      return endResponse({
        error: router.getErrorShape({
          error,
          type,
          path: void 0,
          input: void 0,
          ctx
        })
      }, [
        error
      ]);
    }
  }

  // node_modules/@trpc/server/dist/adapters/fetch/index.mjs
  async function fetchRequestHandler(opts) {
    const resHeaders = new Headers();
    const createContext = async () => {
      return opts.createContext?.({
        req: opts.req,
        resHeaders
      });
    };
    const url = new URL(opts.req.url);
    const path = url.pathname.slice(opts.endpoint.length + 1);
    const req = {
      query: url.searchParams,
      method: opts.req.method,
      headers: Object.fromEntries(opts.req.headers),
      body: await opts.req.text()
    };
    const result = await resolveHTTPResponse({
      req,
      createContext,
      path,
      router: opts.router,
      batching: opts.batching,
      responseMeta: opts.responseMeta,
      onError(o) {
        opts?.onError?.({
          ...o,
          req: opts.req
        });
      }
    });
    for (const [key, value] of Object.entries(result.headers ?? {})) {
      if (typeof value === "undefined") {
        continue;
      }
      if (typeof value === "string") {
        resHeaders.set(key, value);
        continue;
      }
      for (const v of value) {
        resHeaders.append(key, v);
      }
    }
    const res = new Response(result.body, {
      status: result.status,
      headers: resHeaders
    });
    return res;
  }

  // node_modules/@trpc/server/dist/index.mjs
  function getParseFn(procedureParser) {
    const parser = procedureParser;
    if (typeof parser === "function") {
      return parser;
    }
    if (typeof parser.parseAsync === "function") {
      return parser.parseAsync.bind(parser);
    }
    if (typeof parser.parse === "function") {
      return parser.parse.bind(parser);
    }
    if (typeof parser.validateSync === "function") {
      return parser.validateSync.bind(parser);
    }
    if (typeof parser.create === "function") {
      return parser.create.bind(parser);
    }
    if (typeof parser.assert === "function") {
      return (value) => {
        parser.assert(value);
        return value;
      };
    }
    throw new Error("Could not find a validator fn");
  }
  function mergeWithoutOverrides(obj1, ...objs) {
    const newObj = Object.assign(/* @__PURE__ */ Object.create(null), obj1);
    for (const overrides of objs) {
      for (const key in overrides) {
        if (key in newObj && newObj[key] !== overrides[key]) {
          throw new Error(`Duplicate key ${key}`);
        }
        newObj[key] = overrides[key];
      }
    }
    return newObj;
  }
  function createMiddlewareFactory() {
    function createMiddlewareInner(middlewares) {
      return {
        _middlewares: middlewares,
        unstable_pipe(middlewareBuilderOrFn) {
          const pipedMiddleware = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
            middlewareBuilderOrFn
          ];
          return createMiddlewareInner([
            ...middlewares,
            ...pipedMiddleware
          ]);
        }
      };
    }
    function createMiddleware(fn) {
      return createMiddlewareInner([
        fn
      ]);
    }
    return createMiddleware;
  }
  function isPlainObject(obj) {
    return obj && typeof obj === "object" && !Array.isArray(obj);
  }
  function createInputMiddleware(parse) {
    const inputMiddleware = async ({ next, rawInput, input }) => {
      let parsedInput;
      try {
        parsedInput = await parse(rawInput);
      } catch (cause) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: getCauseFromUnknown(cause)
        });
      }
      const combinedInput = isPlainObject(input) && isPlainObject(parsedInput) ? {
        ...input,
        ...parsedInput
      } : parsedInput;
      return next({
        input: combinedInput
      });
    };
    inputMiddleware._type = "input";
    return inputMiddleware;
  }
  function createOutputMiddleware(parse) {
    const outputMiddleware = async ({ next }) => {
      const result = await next();
      if (!result.ok) {
        return result;
      }
      try {
        const data = await parse(result.data);
        return {
          ...result,
          data
        };
      } catch (cause) {
        throw new TRPCError({
          message: "Output validation failed",
          code: "INTERNAL_SERVER_ERROR",
          cause: getCauseFromUnknown(cause)
        });
      }
    };
    outputMiddleware._type = "output";
    return outputMiddleware;
  }
  var middlewareMarker = "middlewareMarker";
  function createNewBuilder(def1, def2) {
    const { middlewares = [], inputs, meta, ...rest } = def2;
    return createBuilder({
      ...mergeWithoutOverrides(def1, rest),
      inputs: [
        ...def1.inputs,
        ...inputs ?? []
      ],
      middlewares: [
        ...def1.middlewares,
        ...middlewares
      ],
      meta: def1.meta && meta ? {
        ...def1.meta,
        ...meta
      } : meta ?? def1.meta
    });
  }
  function createBuilder(initDef = {}) {
    const _def = {
      inputs: [],
      middlewares: [],
      ...initDef
    };
    return {
      _def,
      input(input) {
        const parser = getParseFn(input);
        return createNewBuilder(_def, {
          inputs: [
            input
          ],
          middlewares: [
            createInputMiddleware(parser)
          ]
        });
      },
      output(output) {
        const parseOutput = getParseFn(output);
        return createNewBuilder(_def, {
          output,
          middlewares: [
            createOutputMiddleware(parseOutput)
          ]
        });
      },
      meta(meta) {
        return createNewBuilder(_def, {
          meta
        });
      },
      /**
      * @deprecated
      * This functionality is deprecated and will be removed in the next major version.
      */
      unstable_concat(builder) {
        return createNewBuilder(_def, builder._def);
      },
      use(middlewareBuilderOrFn) {
        const middlewares = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
          middlewareBuilderOrFn
        ];
        return createNewBuilder(_def, {
          middlewares
        });
      },
      query(resolver) {
        return createResolver({
          ..._def,
          query: true
        }, resolver);
      },
      mutation(resolver) {
        return createResolver({
          ..._def,
          mutation: true
        }, resolver);
      },
      subscription(resolver) {
        return createResolver({
          ..._def,
          subscription: true
        }, resolver);
      }
    };
  }
  function createResolver(_def, resolver) {
    const finalBuilder = createNewBuilder(_def, {
      resolver,
      middlewares: [
        async function resolveMiddleware(opts) {
          const data = await resolver(opts);
          return {
            marker: middlewareMarker,
            ok: true,
            data,
            ctx: opts.ctx
          };
        }
      ]
    });
    return createProcedureCaller(finalBuilder._def);
  }
  var codeblock = `
If you want to call this function on the server, you do the following:
This is a client-only function.

const caller = appRouter.createCaller({
  /* ... your context */
});

const result = await caller.call('myProcedure', input);
`.trim();
  function createProcedureCaller(_def) {
    const procedure = async function resolve(opts) {
      if (!opts || !("rawInput" in opts)) {
        throw new Error(codeblock);
      }
      const callRecursive = async (callOpts = {
        index: 0,
        ctx: opts.ctx
      }) => {
        try {
          const middleware = _def.middlewares[callOpts.index];
          const result2 = await middleware({
            ctx: callOpts.ctx,
            type: opts.type,
            path: opts.path,
            rawInput: opts.rawInput,
            meta: _def.meta,
            input: callOpts.input,
            next: async (nextOpts) => {
              return await callRecursive({
                index: callOpts.index + 1,
                ctx: nextOpts && "ctx" in nextOpts ? {
                  ...callOpts.ctx,
                  ...nextOpts.ctx
                } : callOpts.ctx,
                input: nextOpts && "input" in nextOpts ? nextOpts.input : callOpts.input
              });
            }
          });
          return result2;
        } catch (cause) {
          return {
            ok: false,
            error: getTRPCErrorFromUnknown(cause),
            marker: middlewareMarker
          };
        }
      };
      const result = await callRecursive();
      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No result from middlewares - did you forget to `return next()`?"
        });
      }
      if (!result.ok) {
        throw result.error;
      }
      return result.data;
    };
    procedure._def = _def;
    procedure.meta = _def.meta;
    return procedure;
  }
  function mergeRouters(...routerList) {
    const record = mergeWithoutOverrides({}, ...routerList.map((r) => r._def.record));
    const errorFormatter = routerList.reduce((currentErrorFormatter, nextRouter) => {
      if (nextRouter._def._config.errorFormatter && nextRouter._def._config.errorFormatter !== defaultFormatter) {
        if (currentErrorFormatter !== defaultFormatter && currentErrorFormatter !== nextRouter._def._config.errorFormatter) {
          throw new Error("You seem to have several error formatters");
        }
        return nextRouter._def._config.errorFormatter;
      }
      return currentErrorFormatter;
    }, defaultFormatter);
    const transformer = routerList.reduce((prev, current) => {
      if (current._def._config.transformer && current._def._config.transformer !== defaultTransformer) {
        if (prev !== defaultTransformer && prev !== current._def._config.transformer) {
          throw new Error("You seem to have several transformers");
        }
        return current._def._config.transformer;
      }
      return prev;
    }, defaultTransformer);
    const router = createRouterFactory({
      errorFormatter,
      transformer,
      isDev: routerList.some((r) => r._def._config.isDev),
      allowOutsideOfServer: routerList.some((r) => r._def._config.allowOutsideOfServer),
      isServer: routerList.some((r) => r._def._config.isServer),
      $types: routerList[0]?._def._config.$types
    })(record);
    return router;
  }
  var TRPCBuilder = class {
    context() {
      return new TRPCBuilder();
    }
    meta() {
      return new TRPCBuilder();
    }
    create(options) {
      return createTRPCInner()(options);
    }
  };
  var initTRPC = new TRPCBuilder();
  function createTRPCInner() {
    return function initTRPCInner(runtime) {
      const errorFormatter = runtime?.errorFormatter ?? defaultFormatter;
      const transformer = getDataTransformer(runtime?.transformer ?? defaultTransformer);
      const config = {
        transformer,
        isDev: runtime?.isDev ?? globalThis.process?.env?.NODE_ENV !== "production",
        allowOutsideOfServer: runtime?.allowOutsideOfServer ?? false,
        errorFormatter,
        isServer: runtime?.isServer ?? isServerDefault,
        /**
        * @internal
        */
        $types: createFlatProxy((key) => {
          throw new Error(`Tried to access "$types.${key}" which is not available at runtime`);
        })
      };
      {
        const isServer = runtime?.isServer ?? isServerDefault;
        if (!isServer && runtime?.allowOutsideOfServer !== true) {
          throw new Error(`You're trying to use @trpc/server in a non-server environment. This is not supported by default.`);
        }
      }
      return {
        /**
        * These are just types, they can't be used
        * @internal
        */
        _config: config,
        /**
        * Builder object for creating procedures
        */
        procedure: createBuilder({
          meta: runtime?.defaultMeta
        }),
        /**
        * Create reusable middlewares
        */
        middleware: createMiddlewareFactory(),
        /**
        * Create a router
        */
        router: createRouterFactory(config),
        /**
        * Merge Routers
        */
        mergeRouters
      };
    };
  }

  // server/index.ts
  var t = initTRPC.create();
  var appRouter = t.router({
    greeting: t.procedure.query(() => "FROM TRPC")
  });
  addEventListener("fetch", (event) => {
    return event.respondWith(fetchRequestHandler({
      endpoint: "/trpc",
      req: event.request,
      router: appRouter,
      createContext: () => ({})
    }));
  });
})();
/*! Bundled license information:

@trpc/server/dist/resolveHTTPResponse-edf72fc7.mjs:
  (* istanbul ignore if -- @preserve *)

@trpc/server/dist/adapters/fetch/index.mjs:
  (* istanbul ignore if -- @preserve *)
*/
//# sourceMappingURL=index.js.map
