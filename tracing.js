const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const opentelemetry = require('@opentelemetry/sdk-node')
const { OTTracePropagator } = require('@opentelemetry/propagator-ot-trace')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-proto');
const { trace } = require("@opentelemetry/api");
//Exporter
module.exports = (serviceName) => {
   const exporter = new JaegerExporter({
        endpoint: "http://localhost:14268/api/traces",
   });
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
   provider.register({ propagator: new OTTracePropagator() });
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });
   return trace.getTracer(serviceName);
};
