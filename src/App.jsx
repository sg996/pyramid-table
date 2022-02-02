import React, { Component } from 'react';
import { Layout, Form, Table, Checkbox, Row, Col, Tag } from 'antd';
import './App.less';

const { Content } = Layout;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

// 默认【设计属性】最大选中个数，即 【设计属性组合预览】行数
const LAYER = 4;
const WIDTH = 150;
let maxCloumn = 0;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      designAttrsList: [
        { id: 1, name: '颜色', values: ['金色', '白色', '黑色'] },
        { id: 2, name: '内存大小', values: ['128G', '256G', '512G'] },
        { id: 3, name: '运行内存', values: ['8G', '16G'] },
        { id: 4, name: '版本型号', values: ['12', '13', '13 Pro'] },
      ],
      designAttrs: [],
      previewAttrs: []
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
      return result;
    }, []);
    this.setState({ designAttrs, previewAttrs });
  };

  getColumns = (previewAttrs) => {
    const columns = [];
    const previewArr = Object.keys(previewAttrs[previewAttrs.length - 1] || []);

    previewArr.forEach((_, index) => {
      columns.push({
        align: 'center',
        dataIndex: `key${index}`,
        key: `key${index}`,
        columnWidth: WIDTH,
        onCell: (_, rowIndex) => {
          const obj = {};
          maxCloumn = previewArr.length; // 最大行列数
          const curCloumn = Object.keys(previewAttrs[rowIndex]).length; // 当前行列数
          const handlingLayer = this.getIndex(LAYER - 1, 0); // 要合并单元格的行(层)
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

  render() {
    const {
      designAttrsList = [],
      designAttrs = [],
      previewAttrs = [],
    } = this.state;

    return (
      <Layout className="site-layout-background" style={{ padding: '25px', minHeight: '100vh' }}>
        <Content>
          <Form {...layout}>
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
                            designAttrs.length >= LAYER && !designAttrs.includes(item.id)
                          }
                        >
                          <div className="checked-item">{item.name}</div>
                          {designAttrs.includes(item.id) ? <Tag color="gold">{`第${designAttrs.indexOf(item.id) + 1}行`}</Tag> : null}
                        </Checkbox>
                      </Col>
                    ))
                  }
                </Row>
              </CheckboxGroup>
            </FormItem>
            <FormItem label="设计属性组合预览">
              <Table
                bordered
                rowKey="key0"
                columns={this.getColumns(previewAttrs)}
                dataSource={previewAttrs}
                showHeader={false}
                pagination={false}
                scroll={{ x: '100%' }}
                locale={{ emptyText: '暂无数据' }}
              />
            </FormItem>
          </Form>
        </Content>
      </Layout >
    );
  }
}
