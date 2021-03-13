/**
 * Just to enable glsl highlighting using via idea's language injection
 * @param shaderSrc
 */
export function fragment (shaderSrc: string) {
    return (
        target: {fragmentShader: string},
        propertyKey: string,
    ): void => {
        target.fragmentShader = shaderSrc;
    };
}

export function vertex (shaderSrc: string) {
    return (
        target: {vertexShader: string},
        propertyKey: string,
    ): void => {
        target.vertexShader = shaderSrc;
    };
}
