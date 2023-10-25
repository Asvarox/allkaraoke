precision mediump float;

float MAX_FORCE = 300.0;
// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
// the uniform we declared inside our javascript
uniform float uTime;
uniform sampler2D planeTexture;
uniform vec2 uResolution;

uniform vec2 uP0center;
uniform float uP0force;

uniform vec2 uP1center;
uniform float uP1force;

float rnd(float n) {
    return fract(sin(n) * 43758.5453);
}
float random (vec2 st) {
    return rnd(dot(st.xy, vec2(12.9898, 78.233)));
}

void distort(vec2 center, float force, float zoom, float noise) {
    float actualForce = force * MAX_FORCE;
    vec2 centerAbs = center * uResolution;
    vec2 diff = (gl_FragCoord.xy - centerAbs.xy);
    float dist = length(diff);

    vec4 newColor = texture2D(planeTexture, (centerAbs + (diff * zoom) + (noise * 20.0 * (1.0 - pow(zoom, 12.0)))) / uResolution);
    gl_FragColor = newColor;

}

float calculateZoom(vec2 center, float force) {
    float actualForce = force * MAX_FORCE;
    vec2 centerAbs = center * uResolution;
    vec2 diff = (gl_FragCoord.xy - centerAbs.xy);
    float dist = length(diff);

    return pow(smoothstep(0.0, actualForce, dist), 1.0/6.0);
}

void main() {
    float p0zoom = calculateZoom(uP0center, uP0force);
    float p1zoom = calculateZoom(uP1center, uP1force);
    float noise = (random(gl_FragCoord.xy)) / 2.0 - 0.5;

    if (p0zoom < p1zoom) {
        distort(uP0center, uP0force, p0zoom, noise);
    } else {
        distort(uP1center, uP1force, p1zoom, noise);
    }
}