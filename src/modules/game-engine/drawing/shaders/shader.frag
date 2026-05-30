precision mediump float;

const float MAX_FORCE = 300.0;
const int SAMPLE_COUNT = 8; // 2^x
const float INTENSITY = 0.051;
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

vec4 directionalBlur(in vec2 uv, in vec2 direction, in float intensity)
{
    vec4 color = vec4(0.0);

    for (int i=1; i<=SAMPLE_COUNT; i++)
    {
        color += texture2D(planeTexture,uv+float(i)*intensity/float(SAMPLE_COUNT)*direction);
    }

    return color/float(SAMPLE_COUNT);
}

float distort(vec2 center, float force, float comparedIntensity) {
    float actualForce = force * MAX_FORCE;
    vec2 centerAbs = center * uResolution;

    vec2 direction = gl_FragCoord.xy - centerAbs.xy;
    float dist = length(direction) / length(uResolution);


    float intensity = max(0.0, 0.50 - dist) * INTENSITY * pow(force, 1.5);
    if (intensity > comparedIntensity) {
        vec4 newColor = directionalBlur(gl_FragCoord.xy / uResolution, normalize(direction), intensity);
        gl_FragColor = newColor;
    }
    return intensity;
}

void main() {
    gl_FragColor = texture2D(planeTexture, vTextureCoord);
    float p1intensity = distort(uP0center, uP0force, 0.0);
    float p2intensity = distort(uP1center, uP1force, p1intensity);
}