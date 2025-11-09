export const RegexValidatorEnum: {
    DOMAIN: RegExp;
    IP_ADDRESS_V4: RegExp;
    IP_ADDRESS_V6: RegExp;
} = {
    DOMAIN: /^(?!:\/\/)([a-zA-Z0-9-]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/,
    IP_ADDRESS_V4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    IP_ADDRESS_V6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
}
