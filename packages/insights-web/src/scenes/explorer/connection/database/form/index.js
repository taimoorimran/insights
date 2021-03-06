import React, { useEffect, useState } from 'react'
import { useActions, useValues } from 'kea'

import { Button, Form, Input, Modal, Icon, Tag } from "antd"

import Intro from './intro'

import connectionsLogic from '../../logic'

function DatabaseForm ({ form: { getFieldDecorator, validateFieldsAndScroll, getFieldValue } }) {
  const { isAddOpen, isEditOpen, editingConnection, isSaving, didTest, isTesting, testPassed, addIntroMessage } = useValues(connectionsLogic)
  const { addConnection, editConnection, closeConnection, confirmRemoveConnection, testConnection } = useActions(connectionsLogic)

  const [wasEverOpen, setWasEverOpen] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, url, structurePath, timeout } = values

        if (isEditOpen) {
          editConnection(editingConnection._id, name, url, structurePath, timeout)
        } else {
          addConnection({name, url, structurePath, timeout})
        }
      }
    })
  }

  const runTest = () => {
    if (isEditOpen || isAddOpen) {
      setWasEverOpen(true)
      testConnection(getFieldValue('url'), getFieldValue('structurePath'))
    }
  }

  useEffect(runTest, [isEditOpen, isAddOpen])

  const initial = isEditOpen ? editingConnection : {}

  return (
    <Modal
      destroyOnClose
      visible={isAddOpen || isEditOpen}
      title={isAddOpen ? 'New Connection' : 'Edit Connection'}
      onCancel={closeConnection}
      canOutsideClickClose
      footer={[
        isEditOpen ? <Button key="delete" onClick={() => confirmRemoveConnection(editingConnection._id)} type='link' style={{ float: 'left' }}>
          <Icon type='delete' theme="filled" />
          Delete
        </Button> : null,
        <Button key="back" onClick={closeConnection}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={isSaving} onClick={handleAdd}>
          Save
        </Button>,
      ]}
    >
      {wasEverOpen ? <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={handleAdd}>
        {isAddOpen && addIntroMessage ? <Intro /> : null}
        <Form.Item
          label='Name'
          extra="How do you want to call this connection?">
          {getFieldDecorator('name', {
            initialValue: initial.name || '',
            rules: [
              {
                required: true,
                message: 'Please input a name!',
              }
            ]
          })(<Input autoFocus={isAddOpen} placeholder='My Database' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item
          label='Connection'
          extra='Currently only Postgres URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
          {getFieldDecorator('url', {
            initialValue: initial.url || '',
            rules: [
              {
                required: true,
                message: 'Please input a connection string!',
              },
              {
                pattern: /^psql:\/\//,
                message: 'Must be in the format "psql://user:pass@localhost/dbname"'
              }
            ]
          })(<Input placeholder='psql://user:pass@localhost/dbname' style={{width: '100%'}} onBlur={runTest} />)}
        </Form.Item>

        <Form.Item
          label='insights.yml'
          extra='Leave empty to autodetect the database structure'>
          {getFieldDecorator('structurePath', {
            initialValue: initial.structurePath || ''
          })(<Input placeholder='/Users/yourname/projects/code/insights.yml' style={{width: '100%'}} onBlur={runTest} />)}
        </Form.Item>

        <Form.Item
          label='Timeout'
          extra='Statement timeout in seconds'>
          {getFieldDecorator('timeout', {
            initialValue: initial.timeout || '',
            rules: [
              {
                type: 'number',
                message: 'Please input a number',
                transform: value => Number(value)
              }
            ]
          })(<Input placeholder='15' type='number' style={{width: '100%'}} />)}
        </Form.Item>

        <Form.Item label='Test'>
          {!didTest
            ? <Tag>Enter URL to test</Tag>
            : isTesting
              ? <Tag color='blue'>Connecting...</Tag>
              : testPassed
                ? <Tag color='green'>Connection Established</Tag>
                : <Tag color='red'>Connection Failed</Tag>}

          {getFieldValue('url') ? <Button
            type='link'
            onClick={runTest}
            loading={isTesting}>{isTesting ? '' : testPassed ? 'Reconnect' : 'Retry'}</Button> : null}
        </Form.Item>
      </Form> : null}
    </Modal>
  )
}

export default Form.create({ name: 'database' })(DatabaseForm);
