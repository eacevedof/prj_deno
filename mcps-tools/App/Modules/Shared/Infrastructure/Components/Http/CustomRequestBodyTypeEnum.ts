export enum CustomRequestBodyTypeEnum {
    UNKNOWN = "unknown", //binary, DELETE, GET, PUT, PATCH
    FORM_DATA = "form-data",
    FORM = "form", //x-www-form-urlencoded

    JSON = "json", //raw, graphql
    TEXT = "text", //The body is encoded as text and .text() should be used to read the body.
    BINARY = "binary", //The body is encoded as binary and .arrayBuffer() should be used to read the body.
}
