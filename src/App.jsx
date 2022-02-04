import React, { Component } from 'react';
import { Layout, Form, Table, Checkbox, Row, Col, Tag, InputNumber, Button, Space } from 'antd';
import ReactJson from 'react-json-view'
import './App.less';

const { Content } = Layout;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

// 默认【设计属性】最大选中个数，即 【设计属性组合预览】行数
const LAYER = 3;
let maxCloumn = 0;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layer: LAYER,
      designAttrsList: [
        { id: 1, name: '外观', values: ['金色', '银色', '石墨色'] },
        { id: 2, name: '存储容量', values: ['128G', '256G', '512G', '1TB'] },
        { id: 3, name: '运行内存', values: ['8G', '16G'] },
        { id: 4, name: '机型', values: ['12', '13', '13 Pro'] },
        { id: 5, name: '服务计划', values: ['24期', '全款'] },
      ],
      designAttrs: [],
      previewAttrs: [],
      skuAttrs: [], // sku属性
    }
  }
  getItem = (current, columns, len) => {
    const obj = {};
    const tempAttrs = new Array(~~(columns / len)).fill(current).flat(Infinity);
    tempAttrs.forEach((item, index) => {
      obj[`key${index}`] = item;
    });
    return obj;
  };
  getIndex = (num = 0, len = 0) => new Array(num).fill().map((_, index) => (index + len));

  // 设计属性选择
  checkboxChange = (filterVal = [], designAttrsList = []) => {
    const designAttrs = [];
    const skuAttrs = []; // sku属性
    let columns = 1; // 总列数
    // tempAttrs 表示按点击顺序选中的数据
    let tempAttrs = designAttrsList.length !== 0 ? designAttrsList.filter((item) => (
      (filterVal.includes(item.id)) && item
    )) : [];
    // 根据点击顺序排序
    tempAttrs = tempAttrs.sort((a, b) =>
      (filterVal.indexOf(a.id) > filterVal.indexOf(b.id) ? 1 : -1));
    const previewAttrs = tempAttrs.reduce((result, current) => {
      const len = current.values.length;
      columns *= len;
      designAttrs.push(current.id);
      result.push(this.getItem(current.values, columns, len));
      skuAttrs.push(current.values);
      return result;
    }, []);
    this.setState({ designAttrs, previewAttrs, skuAttrs });
  };

  getColumns = (previewAttrs) => {
    const columns = [];
    const previewArr = Object.keys(previewAttrs[previewAttrs.length - 1] || []);

    previewArr.forEach((_, index) => {
      columns.push({
        align: 'center',
        dataIndex: `key${index}`,
        key: `key${index}`,
        onCell: (_, rowIndex) => {
          const obj = {};
          maxCloumn = previewArr.length; // 最大行列数
          const curCloumn = Object.keys(previewAttrs[rowIndex]).length; // 当前行列数
          const handlingLayer = this.getIndex(this.state.layer - 1, 0); // 要合并单元格的行(层)
          const delColumns = this.getIndex(~~(maxCloumn - curCloumn), curCloumn); // 删除的列
          if (handlingLayer.includes(rowIndex)) {
            obj.colSpan = delColumns.includes(index) ? 0 : ~~(maxCloumn / curCloumn);
          }
          return obj;
        },
      });
    });
    return columns;
  }

  // sku 组合算法
  skuCombination = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.reduce((prev, current) => {
      const result = [];
      prev.forEach(project => {
        current.forEach(item => {
          result.push(project.concat(item));
        })
      })
      return result;
    }, [[]]);
  };

  setLayer = (e) => this.setState({ layer: e });

  render() {
    const {
      layer,
      designAttrsList = [],
      designAttrs = [],
      previewAttrs = [],
      skuAttrs = [],
    } = this.state;
    console.log(previewAttrs, skuAttrs);

    return (
      <Layout className="site-layout-background" style={{ padding: '25px', minHeight: '100vh' }}>
        <Content>
          <Form {...layout}>
            <Row>
              <Col span={24}>
                <FormItem label='组合项个数'>
                  <Space>
                    <InputNumber min={previewAttrs.length} max={designAttrsList.length} value={layer} onChange={this.setLayer} />
                    <Button type="primary" onClick={() => { this.setLayer(LAYER); }} > Reset </Button>
                  </Space>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="设计属性" className="design-attributes">
                  <CheckboxGroup
                    style={{ width: '100%' }}
                    onChange={e => this.checkboxChange(e, designAttrsList)}
                  >
                    <Row>
                      {
                        designAttrsList.map(item => (
                          <Col key={item.id} title={item.name} span={12}>
                            <Checkbox
                              value={item.id}
                              checked={designAttrs.includes(item.id)}
                              disabled={
                                designAttrs.length >= layer && !designAttrs.includes(item.id)
                              }
                            >
                              <div className="checked-item">{`${item.name}（${item.values.length}）`}</div>
                              {designAttrs.includes(item.id) ? <Tag color="gold">{`第${designAttrs.indexOf(item.id) + 1}行`}</Tag> : null}
                            </Checkbox>
                          </Col>
                        ))
                      }
                    </Row>
                  </CheckboxGroup>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="设计属性组合预览">
                  <Table
                    className='pyramid-table'
                    bordered
                    rowKey="key0"
                    columns={this.getColumns(previewAttrs)}
                    dataSource={previewAttrs}
                    showHeader={false}
                    pagination={false}
                    // scroll={{ x: true }}
                    locale={{ emptyText: '暂无数据' }}
                  />
                </FormItem>
              </Col>
              <Col span={10} offset={2}>
                <FormItem label="组合数据">
                  <ReactJson
                    src={previewAttrs}
                    theme="google"
                    iconStyle="square"
                    collapsed={true}
                    displayDataTypes={false}
                  />
                </FormItem>
              </Col>
              <Col span={10} offset={2}>
                <FormItem label="sku 组合数据">
                  <ReactJson
                    src={this.skuCombination(skuAttrs)}
                    theme="google"
                    iconStyle="square"
                    collapsed={true}
                    displayDataTypes={false}
                    enableClipboard={true}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Content>
      </Layout >
    );
  }
}
