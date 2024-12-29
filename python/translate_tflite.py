import numpy as np
import tensorflow as tf
import tensorflow_text as tf_text

class TokenizerModel(tf.keras.Model):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tokenizer = tf_text.WhitespaceTokenizer()

    @tf.function(input_signature=[
        tf.TensorSpec(shape=[None], dtype=tf.string, name='input')
    ])
    def call(self, input_tensor):
        return { 'tokens': self.tokenizer.tokenize(input_tensor).flat_values }

# Load TFLite model and allocate tensors.
# interpreter = tf.lite.Interpreter(model_path="translate/ja_en/decoder_init_0.tflite")
# interpreter = tf.lite.Interpreter(model_path="translate/ja_en/decoder_step_0.tflite")
interpreter = tf.lite.Interpreter(model_path="translate/ja_en/encoder_0.tflite")
interpreter.allocate_tensors()

# Get input and output tensors.
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Test model on random input data.
input_shape = input_details[0]['shape']
print(input_details)
print(input_shape)
# input_data = np.array(np.random.random_sample(input_shape), dtype=np.int32)
# input_data = np.array([[10]], dtype=np.int32)
input_data = np.array(["明らかに"]) # clearly
model = TokenizerModel

print(input_data)
print(np.array(np.random.random_sample(input_shape), dtype=np.int32))

interpreter.set_tensor(input_details[0]['index'], input_data)

interpreter.invoke()

# The function `get_tensor()` returns a copy of the tensor data.
# Use `tensor()` in order to get a pointer to the tensor.
output_data = interpreter.get_tensor(output_details[0]['index'])
print(output_data)
print(output_details)
print(len(output_details))