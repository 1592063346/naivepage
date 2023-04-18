import type { AppProps } from "next/app";
import { Row, Col } from "antd";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Row justify='center' className='infoPage' gutter={[24, 24]}>
      <Col span={20}>
        <Component {...pageProps} />
      </Col>
    </Row>
  );
};

export default App;