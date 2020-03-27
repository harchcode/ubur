attribute vec4 aPosition;

varying vec4 vPosition;

uniform mat4 uTransform;
uniform mat4 uVPTransform;

void main(void) {
    gl_Position = uVPTransform * uTransform * aPosition;

    vPosition = aPosition;
}
