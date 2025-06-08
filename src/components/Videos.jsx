import MediaSlider from './MediaSlider'

const Videos = (props) => (
  <MediaSlider
    {...props}
    type="video"
    accept="video/*"
    label="Видео"
  />
)

export default Videos