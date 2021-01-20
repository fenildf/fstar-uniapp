<template>
	<view>
		<form @submit="handleSubmit">
			<input placeholder="教务系统账号" name="username" class="username"></input>
			<input placeholder="教务系统密码" name="password" password class="password"></input>
			<input v-if="useVPN" name="vpnusername" placeholder="校园网账号" class="vpn-username"></input>
			<input v-if="useVPN" name="vpnpassword" placeholder="校园网密码" password class="vpn-password"></input>
			<input name="semester" placeholder="学期(非必须 格式 2019-2020-1)" />
			<button form-type="submit" type="primary">验证</button>
		</form>
		<w-loading click="false" ref="loading"></w-loading>
		<uni-popup type="top" ref="message">
			<view class="message">
				{{message}}
			</view>
		</uni-popup>
		<text class="copy-right">Copyright © 2021 mdreamfever, all rights reserved.</text>
	</view>
</template>

<script>
	const app = getApp()
	export default {
		data() {
			return {
				useVPN: app.globalData.settings.useVPN,
				message: "发生了错误",
			}
		},
		methods: {
			handleSubmit(e) {
				// console.log(e)
				this.$refs.loading.open()
				let value = e.detail.value
				console.log(value)
				let username = value.username
				let passowrd = value.password
				let kksj = ""
				let date = new Date()
				let year = date.getFullYear()
				let month = date.getMonth() + 1
				if (month >= 8) {
					kksj = `${year}-${year+1}-1`
				} else {
					kksj = `${year-1}-${year}-2`
				}
				console.log(`开课学期 ${kksj}`)
				let loginData = {
					"username": username,
					"password": passowrd,
					"vpn_username": "",
					"vpn_password": "",
					"xsfs": "",
					"kksj": kksj
				}
				if (value.semester) {
					loginData.kksj = value.semester
				}
				let url = app.globalData.host
				if (this.useVPN) {
					let vpnusername = value.vpnusername
					let vpnpassword = value.vpnpassword
					loginData.vpn_username = vpnusername
					loginData.vpn_password = vpnpassword
					url += "/vpn"
				} else {
					url += "/just"
				}
				url += "/course"
				try {
					uni.request({
						url: url,
						data: loginData,
						method: "GET",
						success: (res) => {
							console.log(res)
							this.$refs.loading.close()
							let response = res.data
							if (response.code !== 200) {
								console.log(response.message)
								this.message = response.message
								this.$refs.message.open()
							} else {
								uni.setStorage({
									key: "login_key",
									data: loginData
								})
								uni.setStorage({
									key: "course_key",
									data: response.data,
								})
								app.globalData.course = response.data
								app.globalData.settings.currentSemester = loginData.kksj
								app.globalData.settings.scoreQuerySemester = loginData.kksj
								uni.setStorage({
									key: "settings_key",
									data: app.globalData.settings
								})
								console.log("login success")
								uni.switchTab({
									url: "../index/index"
								})
							}
						},
						fail: (res) => {
							this.$refs.loading.close()
							this.message = "发生了错误"
							this.$refs.message.open()
						}
					})
				} catch (e) {
					console.log(e)
					this.$refs.loading.close()
					this.message = "发生了错误"
					this.$refs.message.open()
				}
			}
		}
	}
</script>

<style>
	input {
		margin: 20rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 20rpx;
		font-size: .8em;
	}

	button {
		margin: 20rpx;
	}
</style>
