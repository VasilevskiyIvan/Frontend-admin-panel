import MediaSlider from './MediaSlider'

const Photos = (props) => (
  <MediaSlider
    {...props}
    type="image"
    accept="image/*"
    label="Фотографии"
  />
)

export default Photos